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
    const { wallet_id, card_id, price_ball, action } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "list") {
      if (!wallet_id || !card_id || !price_ball || price_ball < 1) {
        return new Response(JSON.stringify({ error: "Missing params" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify ownership
      const { data: card } = await supabase
        .from("player_cards")
        .select("*")
        .eq("id", card_id)
        .eq("wallet_id", wallet_id)
        .single();

      if (!card) {
        return new Response(JSON.stringify({ error: "Card not found or not owned" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (card.is_listed) {
        return new Response(JSON.stringify({ error: "Already listed" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create listing
      await supabase.from("card_listings").insert({
        card_id, seller_wallet_id: wallet_id, price_ball, status: "active",
      });
      await supabase.from("player_cards").update({ is_listed: true }).eq("id", card_id);

      return new Response(JSON.stringify({ success: true, message: "Card listed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "buy") {
      const { listing_id, buyer_wallet_id } = await req.json().catch(() => ({ listing_id: null, buyer_wallet_id: null }));
      // Re-parse since we already consumed body
      if (!listing_id && !card_id) {
        return new Response(JSON.stringify({ error: "Missing listing_id" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (action === "cancel") {
      const { data: listing } = await supabase
        .from("card_listings")
        .select("*")
        .eq("card_id", card_id)
        .eq("seller_wallet_id", wallet_id)
        .eq("status", "active")
        .single();

      if (!listing) {
        return new Response(JSON.stringify({ error: "Listing not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase.from("card_listings").update({ status: "cancelled" }).eq("id", listing.id);
      await supabase.from("player_cards").update({ is_listed: false }).eq("id", card_id);

      return new Response(JSON.stringify({ success: true, message: "Listing cancelled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
