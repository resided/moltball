import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wallet_id, player_id, shares } = await req.json();
    if (!wallet_id || !player_id || !shares || shares < 1) {
      return new Response(JSON.stringify({ error: "Missing wallet_id, player_id, or shares" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get player info
    const { data: player, error: pErr } = await supabase
      .from("players")
      .select("id, name, price_ball, available_shares")
      .eq("id", player_id)
      .single();

    if (pErr || !player) {
      return new Response(JSON.stringify({ error: "Player not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (player.available_shares < shares) {
      return new Response(JSON.stringify({ error: "Not enough shares available" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const totalCost = player.price_ball * shares;

    // Get wallet
    const { data: wallet, error: wErr } = await supabase
      .from("user_wallets")
      .select("id, ball_balance")
      .eq("id", wallet_id)
      .single();

    if (wErr || !wallet) {
      return new Response(JSON.stringify({ error: "Wallet not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (wallet.ball_balance < totalCost) {
      return new Response(JSON.stringify({ error: "Insufficient $BALL balance", required: totalCost, balance: wallet.ball_balance }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduct balance
    const { error: balErr } = await supabase
      .from("user_wallets")
      .update({ ball_balance: wallet.ball_balance - totalCost })
      .eq("id", wallet_id);

    if (balErr) throw balErr;

    // Reduce available shares
    const { error: shareErr } = await supabase
      .from("players")
      .update({ available_shares: player.available_shares - shares })
      .eq("id", player_id);

    if (shareErr) throw shareErr;

    // Upsert holding
    const { data: existing } = await supabase
      .from("user_holdings")
      .select("id, shares, avg_price")
      .eq("wallet_id", wallet_id)
      .eq("player_id", player_id)
      .maybeSingle();

    if (existing) {
      const newShares = existing.shares + shares;
      const newAvg = ((existing.avg_price * existing.shares) + (player.price_ball * shares)) / newShares;
      await supabase.from("user_holdings").update({ shares: newShares, avg_price: Math.round(newAvg * 100) / 100 }).eq("id", existing.id);
    } else {
      await supabase.from("user_holdings").insert({ wallet_id, player_id, shares, avg_price: player.price_ball });
    }

    // Apply price impact (small increase per share bought)
    const priceImpact = shares * 0.5;
    const newPrice = Math.round((player.price_ball + priceImpact) * 100) / 100;
    await supabase.from("players").update({ price_ball: newPrice }).eq("id", player_id);

    // Record price history
    await supabase.from("player_price_history").insert({
      player_id,
      price: newPrice,
      volume: shares,
    });

    return new Response(JSON.stringify({
      success: true,
      player: player.name,
      shares_bought: shares,
      total_cost: totalCost,
      new_balance: wallet.ball_balance - totalCost,
      new_price: newPrice,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
