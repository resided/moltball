import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rarity tiers and their stat bonus ranges (like FUT chemistry/boost)
const rarityBonusRange: Record<string, { min: number; max: number }> = {
  bronze: { min: 0, max: 1 },
  silver: { min: 0, max: 2 },
  gold: { min: 1, max: 3 },
  premium: { min: 2, max: 5 },
  icon: { min: 3, max: 7 },
};

// Which rarities each pack tier can pull
const packPullWeights: Record<string, Record<string, number>> = {
  bronze: { bronze: 85, silver: 14, gold: 1, premium: 0, icon: 0 },
  silver: { bronze: 40, silver: 50, gold: 9, premium: 1, icon: 0 },
  gold: { bronze: 5, silver: 30, gold: 55, premium: 9, icon: 1 },
  premium: { bronze: 0, silver: 10, gold: 50, premium: 35, icon: 5 },
  icon: { bronze: 0, silver: 0, gold: 30, premium: 50, icon: 20 },
};

function weightedRandom(weights: Record<string, number>): string {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [key, weight] of Object.entries(weights)) {
    r -= weight;
    if (r <= 0) return key;
  }
  return Object.keys(weights)[0];
}

function randomBonus(rarity: string): number {
  const range = rarityBonusRange[rarity] || { min: 0, max: 1 };
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wallet_id, pack_type_id } = await req.json();
    if (!wallet_id || !pack_type_id) {
      return new Response(JSON.stringify({ error: "Missing wallet_id or pack_type_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get pack type
    const { data: pack, error: packErr } = await supabase
      .from("pack_types")
      .select("*")
      .eq("id", pack_type_id)
      .single();

    if (packErr || !pack) {
      return new Response(JSON.stringify({ error: "Pack not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    if (wallet.ball_balance < pack.price_ball) {
      return new Response(JSON.stringify({ error: "Insufficient $BALL balance", required: pack.price_ball, balance: wallet.ball_balance }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all players grouped by rarity
    const { data: allPlayers, error: plErr } = await supabase
      .from("players")
      .select("id, name, position, overall_rating, rarity, pace, shooting, passing, dribbling, defending, physicality");

    if (plErr || !allPlayers || allPlayers.length === 0) {
      return new Response(JSON.stringify({ error: "No players in database" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const playersByRarity: Record<string, any[]> = {};
    for (const p of allPlayers) {
      if (!playersByRarity[p.rarity]) playersByRarity[p.rarity] = [];
      playersByRarity[p.rarity].push(p);
    }

    const weights = packPullWeights[pack.tier] || packPullWeights.bronze;
    const cards: any[] = [];
    const cardIds: string[] = [];

    for (let i = 0; i < pack.cards_count; i++) {
      let rarity: string;

      // First card uses guaranteed rarity if present
      if (i === 0 && pack.guaranteed_rarity) {
        // Pick guaranteed rarity or higher
        const rarityOrder = ["bronze", "silver", "gold", "premium", "icon"];
        const minIdx = rarityOrder.indexOf(pack.guaranteed_rarity);
        const eligibleRarities = rarityOrder.slice(minIdx);
        // Weight toward guaranteed tier
        const gWeights: Record<string, number> = {};
        for (const r of eligibleRarities) {
          gWeights[r] = weights[r] || 1;
        }
        rarity = weightedRandom(gWeights);
      } else {
        rarity = weightedRandom(weights);
      }

      // Get eligible players - players matching this rarity
      let pool = playersByRarity[rarity];
      if (!pool || pool.length === 0) {
        // Fallback to any available rarity
        pool = allPlayers;
        rarity = pool[0].rarity;
      }

      const player = pool[Math.floor(Math.random() * pool.length)];

      // Generate stat bonuses based on card rarity
      const cardData = {
        player_id: player.id,
        wallet_id,
        rarity,
        pace_bonus: randomBonus(rarity),
        shooting_bonus: randomBonus(rarity),
        passing_bonus: randomBonus(rarity),
        dribbling_bonus: randomBonus(rarity),
        defending_bonus: randomBonus(rarity),
        physicality_bonus: randomBonus(rarity),
        overall_bonus: Math.floor(randomBonus(rarity) / 2),
        pack_id: pack.id,
        is_tradeable: true,
        is_listed: false,
      };

      const { data: card, error: cErr } = await supabase
        .from("player_cards")
        .insert(cardData)
        .select("*")
        .single();

      if (cErr) throw cErr;

      cards.push({
        ...card,
        player_name: player.name,
        player_position: player.position,
        player_overall: player.overall_rating,
        player_pace: player.pace,
        player_shooting: player.shooting,
        player_passing: player.passing,
        player_dribbling: player.dribbling,
        player_defending: player.defending,
        player_physicality: player.physicality,
      });
      cardIds.push(card.id);
    }

    // Deduct balance
    await supabase
      .from("user_wallets")
      .update({ ball_balance: wallet.ball_balance - pack.price_ball })
      .eq("id", wallet_id);

    // Record pack open
    await supabase.from("pack_opens").insert({
      wallet_id,
      pack_type_id: pack.id,
      cards_received: cardIds,
      cost_ball: pack.price_ball,
    });

    return new Response(JSON.stringify({
      success: true,
      pack_name: pack.name,
      cards,
      new_balance: wallet.ball_balance - pack.price_ball,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
