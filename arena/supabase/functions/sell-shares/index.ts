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

    // Check holding
    const { data: holding, error: hErr } = await supabase
      .from("user_holdings")
      .select("id, shares, avg_price")
      .eq("wallet_id", wallet_id)
      .eq("player_id", player_id)
      .maybeSingle();

    if (hErr || !holding || holding.shares < shares) {
      return new Response(JSON.stringify({ error: "Not enough shares to sell" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get current price
    const { data: player } = await supabase
      .from("players")
      .select("id, name, price_ball, available_shares")
      .eq("id", player_id)
      .single();

    if (!player) {
      return new Response(JSON.stringify({ error: "Player not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const totalValue = player.price_ball * shares;

    // Credit balance
    const { data: wallet } = await supabase
      .from("user_wallets")
      .select("id, ball_balance")
      .eq("id", wallet_id)
      .single();

    if (!wallet) {
      return new Response(JSON.stringify({ error: "Wallet not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("user_wallets").update({ ball_balance: wallet.ball_balance + totalValue }).eq("id", wallet_id);

    // Return shares to pool
    await supabase.from("players").update({ available_shares: player.available_shares + shares }).eq("id", player_id);

    // Update or delete holding
    const remaining = holding.shares - shares;
    if (remaining <= 0) {
      await supabase.from("user_holdings").delete().eq("id", holding.id);
    } else {
      await supabase.from("user_holdings").update({ shares: remaining }).eq("id", holding.id);
    }

    // Price impact (decrease)
    const priceImpact = shares * 0.5;
    const newPrice = Math.max(10, Math.round((player.price_ball - priceImpact) * 100) / 100);
    await supabase.from("players").update({ price_ball: newPrice }).eq("id", player_id);

    await supabase.from("player_price_history").insert({
      player_id,
      price: newPrice,
      volume: shares,
    });

    const profit = totalValue - (holding.avg_price * shares);

    return new Response(JSON.stringify({
      success: true,
      player: player.name,
      shares_sold: shares,
      total_value: totalValue,
      profit: Math.round(profit * 100) / 100,
      new_balance: wallet.ball_balance + totalValue,
      new_price: newPrice,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
