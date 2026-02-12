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
    const { wallet_id, listing_id } = await req.json();
    if (!wallet_id || !listing_id) {
      return new Response(JSON.stringify({ error: "Missing wallet_id or listing_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get listing
    const { data: listing, error: lErr } = await supabase
      .from("card_listings")
      .select("*")
      .eq("id", listing_id)
      .eq("status", "active")
      .single();

    if (lErr || !listing) {
      return new Response(JSON.stringify({ error: "Listing not found or already sold" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (listing.seller_wallet_id === wallet_id) {
      return new Response(JSON.stringify({ error: "Cannot buy your own listing" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check buyer balance
    const { data: buyer } = await supabase
      .from("user_wallets")
      .select("id, ball_balance")
      .eq("id", wallet_id)
      .single();

    if (!buyer || buyer.ball_balance < listing.price_ball) {
      return new Response(JSON.stringify({ error: "Insufficient balance" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5% marketplace fee
    const fee = Math.round(listing.price_ball * 0.05 * 100) / 100;
    const sellerReceives = listing.price_ball - fee;

    // Deduct buyer
    await supabase.from("user_wallets")
      .update({ ball_balance: buyer.ball_balance - listing.price_ball })
      .eq("id", wallet_id);

    // Credit seller
    const { data: seller } = await supabase
      .from("user_wallets")
      .select("id, ball_balance")
      .eq("id", listing.seller_wallet_id)
      .single();

    if (seller) {
      await supabase.from("user_wallets")
        .update({ ball_balance: seller.ball_balance + sellerReceives })
        .eq("id", seller.id);
    }

    // Transfer card ownership
    await supabase.from("player_cards")
      .update({ wallet_id, is_listed: false })
      .eq("id", listing.card_id);

    // Mark listing as sold
    await supabase.from("card_listings")
      .update({ status: "sold", buyer_wallet_id: wallet_id, sold_at: new Date().toISOString() })
      .eq("id", listing_id);

    return new Response(JSON.stringify({
      success: true,
      price_paid: listing.price_ball,
      fee,
      seller_received: sellerReceives,
      new_balance: buyer.ball_balance - listing.price_ball,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
