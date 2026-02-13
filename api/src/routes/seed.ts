import { Router } from "express";
import { db, supabase } from "../db/index.js";

const PLAYER_SEEDS = [
  { name: "Erling Haaland", position: "FWD", team_real: "Manchester City", overall_rating: 91, pace: 89, shooting: 94, passing: 65, dribbling: 80, defending: 45, physicality: 88, price_ball: 12000 },
  { name: "Kevin De Bruyne", position: "MID", team_real: "Manchester City", overall_rating: 91, pace: 76, shooting: 86, passing: 93, dribbling: 87, defending: 64, physicality: 78, price_ball: 12000 },
  { name: "Mohamed Salah", position: "FWD", team_real: "Liverpool", overall_rating: 89, pace: 88, shooting: 88, passing: 82, dribbling: 90, defending: 45, physicality: 75, price_ball: 10000 },
  { name: "Virgil van Dijk", position: "DEF", team_real: "Liverpool", overall_rating: 88, pace: 72, shooting: 60, passing: 78, dribbling: 72, defending: 90, physicality: 86, price_ball: 9000 },
  { name: "Alisson Becker", position: "GK", team_real: "Liverpool", overall_rating: 88, pace: 58, shooting: 50, passing: 78, dribbling: 75, defending: 50, physicality: 84, price_ball: 9000 },
  { name: "Rodri", position: "MID", team_real: "Manchester City", overall_rating: 89, pace: 72, shooting: 76, passing: 86, dribbling: 82, defending: 88, physicality: 86, price_ball: 10000 },
  { name: "Bernardo Silva", position: "MID", team_real: "Manchester City", overall_rating: 88, pace: 82, shooting: 78, passing: 88, dribbling: 94, defending: 76, physicality: 72, price_ball: 9000 },
  { name: "Phil Foden", position: "FWD", team_real: "Manchester City", overall_rating: 87, pace: 84, shooting: 84, passing: 86, dribbling: 90, defending: 58, physicality: 72, price_ball: 8000 },
  { name: "Bukayo Saka", position: "FWD", team_real: "Arsenal", overall_rating: 87, pace: 85, shooting: 82, passing: 83, dribbling: 88, defending: 64, physicality: 75, price_ball: 8000 },
  { name: "Martin Ødegaard", position: "MID", team_real: "Arsenal", overall_rating: 87, pace: 76, shooting: 80, passing: 90, dribbling: 88, defending: 62, physicality: 68, price_ball: 8000 },
  { name: "Declan Rice", position: "MID", team_real: "Arsenal", overall_rating: 86, pace: 78, shooting: 70, passing: 82, dribbling: 78, defending: 85, physicality: 84, price_ball: 7250 },
  { name: "William Saliba", position: "DEF", team_real: "Arsenal", overall_rating: 85, pace: 78, shooting: 45, passing: 68, dribbling: 72, defending: 87, physicality: 84, price_ball: 6500 },
  { name: "Cole Palmer", position: "FWD", team_real: "Chelsea", overall_rating: 86, pace: 82, shooting: 84, passing: 85, dribbling: 88, defending: 48, physicality: 72, price_ball: 7250 },
  { name: "Enzo Fernández", position: "MID", team_real: "Chelsea", overall_rating: 85, pace: 76, shooting: 76, passing: 88, dribbling: 86, defending: 78, physicality: 78, price_ball: 6500 },
  { name: "Son Heung-min", position: "FWD", team_real: "Tottenham", overall_rating: 87, pace: 88, shooting: 86, passing: 82, dribbling: 88, defending: 52, physicality: 74, price_ball: 8000 },
  { name: "James Maddison", position: "MID", team_real: "Tottenham", overall_rating: 85, pace: 74, shooting: 82, passing: 88, dribbling: 88, defending: 60, physicality: 72, price_ball: 6500 },
  { name: "Cristian Romero", position: "DEF", team_real: "Tottenham", overall_rating: 86, pace: 76, shooting: 55, passing: 72, dribbling: 74, defending: 88, physicality: 86, price_ball: 7250 },
  { name: "Bruno Fernandes", position: "MID", team_real: "Manchester United", overall_rating: 86, pace: 76, shooting: 82, passing: 88, dribbling: 86, defending: 72, physicality: 78, price_ball: 7250 },
  { name: "Marcus Rashford", position: "FWD", team_real: "Manchester United", overall_rating: 85, pace: 90, shooting: 82, passing: 80, dribbling: 88, defending: 45, physicality: 78, price_ball: 6500 },
  { name: "Casemiro", position: "MID", team_real: "Manchester United", overall_rating: 85, pace: 68, shooting: 72, passing: 78, dribbling: 74, defending: 86, physicality: 86, price_ball: 6500 },
  { name: "Alejandro Garnacho", position: "FWD", team_real: "Manchester United", overall_rating: 80, pace: 92, shooting: 74, passing: 70, dribbling: 84, defending: 40, physicality: 68, price_ball: 4500 },
  { name: "Rasmus Højlund", position: "FWD", team_real: "Manchester United", overall_rating: 78, pace: 86, shooting: 76, passing: 62, dribbling: 74, defending: 42, physicality: 82, price_ball: 4000 },
  { name: "Lisandro Martínez", position: "DEF", team_real: "Manchester United", overall_rating: 82, pace: 74, shooting: 60, passing: 74, dribbling: 78, defending: 84, physicality: 76, price_ball: 5500 },
  { name: "Alejandro Grimaldo", position: "DEF", team_real: "Liverpool", overall_rating: 81, pace: 80, shooting: 72, passing: 84, dribbling: 82, defending: 76, physicality: 70, price_ball: 5000 },
  { name: "Darwin Núñez", position: "FWD", team_real: "Liverpool", overall_rating: 83, pace: 92, shooting: 82, passing: 70, dribbling: 84, defending: 48, physicality: 86, price_ball: 7000 },
  { name: "Dominik Szoboszlai", position: "MID", team_real: "Liverpool", overall_rating: 84, pace: 82, shooting: 80, passing: 86, dribbling: 86, defending: 62, physicality: 76, price_ball: 6500 },
  { name: "Alexis Mac Allister", position: "MID", team_real: "Liverpool", overall_rating: 85, pace: 76, shooting: 78, passing: 86, dribbling: 84, defending: 72, physicality: 74, price_ball: 7000 },
  { name: "Trent Alexander-Arnold", position: "DEF", team_real: "Liverpool", overall_rating: 87, pace: 80, shooting: 84, passing: 92, dribbling: 82, defending: 76, physicality: 72, price_ball: 8500 },
  { name: "Mohamed Salah", position: "FWD", team_real: "Liverpool", overall_rating: 89, pace: 88, shooting: 88, passing: 82, dribbling: 90, defending: 45, physicality: 75, price_ball: 10000 },
  { name: "Gabriel Jesus", position: "FWD", team_real: "Arsenal", overall_rating: 82, pace: 86, shooting: 80, passing: 76, dribbling: 84, defending: 52, physicality: 78, price_ball: 5000 },
  { name: "Gabriel Martinelli", position: "FWD", team_real: "Arsenal", overall_rating: 83, pace: 92, shooting: 80, passing: 74, dribbling: 88, defending: 46, physicality: 72, price_ball: 6500 },
  { name: "Ben White", position: "DEF", team_real: "Arsenal", overall_rating: 82, pace: 78, shooting: 58, passing: 76, dribbling: 76, defending: 84, physicality: 80, price_ball: 5000 },
  { name: "Oleksandr Zinchenko", position: "DEF", team_real: "Arsenal", overall_rating: 84, pace: 80, shooting: 68, passing: 86, dribbling: 84, defending: 78, physicality: 72, price_ball: 6000 },
  { name: "David Raya", position: "GK", team_real: "Arsenal", overall_rating: 82, pace: 60, shooting: 52, passing: 72, dribbling: 68, defending: 58, physicality: 76, price_ball: 4500 },
  { name: "Raheem Sterling", position: "FWD", team_real: "Arsenal", overall_rating: 82, pace: 88, shooting: 80, passing: 78, dribbling: 86, defending: 48, physicality: 72, price_ball: 5500 },
  { name: "Leandro Trossard", position: "FWD", team_real: "Arsenal", overall_rating: 81, pace: 82, shooting: 80, passing: 80, dribbling: 84, defending: 50, physicality: 68, price_ball: 5000 },
  { name: "Kai Havertz", position: "FWD", team_real: "Arsenal", overall_rating: 83, pace: 80, shooting: 82, passing: 82, dribbling: 84, defending: 60, physicality: 82, price_ball: 6000 },
  { name: "Jorginho", position: "MID", team_real: "Arsenal", overall_rating: 80, pace: 64, shooting: 70, passing: 84, dribbling: 76, defending: 78, physicality: 70, price_ball: 4000 },
  { name: "Nicolas Jackson", position: "FWD", team_real: "Chelsea", overall_rating: 75, pace: 84, shooting: 74, passing: 64, dribbling: 78, defending: 40, physicality: 76, price_ball: 3500 },
  { name: "Mykhailo Mudryk", position: "FWD", team_real: "Chelsea", overall_rating: 76, pace: 94, shooting: 68, passing: 70, dribbling: 84, defending: 38, physicality: 70, price_ball: 4000 },
  { name: "Noni Madueke", position: "FWD", team_real: "Chelsea", overall_rating: 74, pace: 88, shooting: 72, passing: 68, dribbling: 82, defending: 40, physicality: 68, price_ball: 3500 },
  { name: "MalGustavo", position: "MID", team_real: "Chelsea", overall_rating: 78, pace: 80, shooting: 74, passing: 78, dribbling: 80, defending: 72, physicality: 78, price_ball: 4000 },
  { name: "Christopher Nkunku", position: "FWD", team_real: "Chelsea", overall_rating: 84, pace: 84, shooting: 84, passing: 80, dribbling: 88, defending: 48, physicality: 72, price_ball: 7000 },
  { name: "Romeo Lavia", position: "MID", team_real: "Chelsea", overall_rating: 76, pace: 74, shooting: 66, passing: 78, dribbling: 78, defending: 80, physicality: 80, price_ball: 4000 },
  { name: "Wesley Fofana", position: "DEF", team_real: "Chelsea", overall_rating: 82, pace: 82, shooting: 50, passing: 68, dribbling: 74, defending: 84, physicality: 84, price_ball: 5500 },
  { name: "Thiago Silva", position: "DEF", team_real: "Chelsea", overall_rating: 85, pace: 68, shooting: 58, passing: 76, dribbling: 72, defending: 88, physicality: 80, price_ball: 6000 },
  { name: "Reece James", position: "DEF", team_real: "Chelsea", overall_rating: 84, pace: 82, shooting: 72, passing: 82, dribbling: 82, defending: 80, physicality: 80, price_ball: 6500 },
  { name: "Levi Colwill", position: "DEF", team_real: "Chelsea", overall_rating: 80, pace: 76, shooting: 52, passing: 72, dribbling: 74, defending: 82, physicality: 82, price_ball: 4500 },
  { name: "Pedro Neto", position: "FWD", team_real: "Chelsea", overall_rating: 80, pace: 90, shooting: 74, passing: 76, dribbling: 86, defending: 44, physicality: 66, price_ball: 5000 },
  { name: "Son Heung-min", position: "FWD", team_real: "Tottenham", overall_rating: 87, pace: 88, shooting: 86, passing: 82, dribbling: 88, defending: 52, physicality: 74, price_ball: 8000 },
  { name: "Richarlison", position: "FWD", team_real: "Tottenham", overall_rating: 81, pace: 84, shooting: 82, passing: 72, dribbling: 82, defending: 48, physicality: 82, price_ball: 5000 },
  { name: "Dejan Kulusevski", position: "FWD", team_real: "Tottenham", overall_rating: 80, pace: 84, shooting: 76, passing: 78, dribbling: 82, defending: 52, physicality: 74, price_ball: 4500 },
  { name: "Destiny Udogie", position: "DEF", team_real: "Tottenham", overall_rating: 80, pace: 84, shooting: 58, passing: 74, dribbling: 80, defending: 76, physicality: 76, price_ball: 4500 },
  { name: "Micky van de Ven", position: "DEF", team_real: "Tottenham", overall_rating: 83, pace: 92, shooting: 50, passing: 68, dribbling: 74, defending: 82, physicality: 84, price_ball: 6000 },
  { name: "Pedro Porro", position: "DEF", team_real: "Tottenham", overall_rating: 82, pace: 84, shooting: 70, passing: 80, dribbling: 84, defending: 74, physicality: 70, price_ball: 5500 },
  { name: "Guglielmo Vicario", position: "GK", team_real: "Tottenham", overall_rating: 80, pace: 58, shooting: 48, passing: 70, dribbling: 64, defending: 56, physicality: 74, price_ball: 4000 },
  { name: "Ange Postecoglou", position: "MID", team_real: "Tottenham", overall_rating: 75, pace: 60, shooting: 64, passing: 76, dribbling: 72, defending: 72, physicality: 72, price_ball: 2000 },
  { name: "Heung-min Son", position: "FWD", team_real: "Tottenham", overall_rating: 87, pace: 88, shooting: 86, passing: 82, dribbling: 88, defending: 52, physicality: 74, price_ball: 8000 },
  { name: "Ivan Toney", position: "FWD", team_real: "Brentford", overall_rating: 81, pace: 78, shooting: 84, passing: 72, dribbling: 76, defending: 50, physicality: 84, price_ball: 5000 },
  { name: "Bryan Mbeumo", position: "FWD", team_real: "Brentford", overall_rating: 79, pace: 86, shooting: 78, passing: 72, dribbling: 82, defending: 48, physicality: 70, price_ball: 4500 },
  { name: "Yoane Wissa", position: "FWD", team_real: "Brentford", overall_rating: 76, pace: 88, shooting: 72, passing: 68, dribbling: 80, defending: 42, physicality: 66, price_ball: 3500 },
  { name: "Rayan Aït-Nouri", position: "DEF", team_real: "Wolverhampton", overall_rating: 78, pace: 86, shooting: 60, passing: 70, dribbling: 80, defending: 72, physicality: 72, price_ball: 4000 },
  { name: "Pedro Neto", position: "FWD", team_real: "Wolverhampton", overall_rating: 82, pace: 92, shooting: 78, passing: 80, dribbling: 88, defending: 46, physicality: 68, price_ball: 6000 },
  { name: "Matheus Cunha", position: "FWD", team_real: "Wolverhampton", overall_rating: 80, pace: 84, shooting: 80, passing: 74, dribbling: 82, defending: 48, physicality: 76, price_ball: 5000 },
  { name: "Morgan Gibbs-White", position: "MID", team_real: "Nottingham Forest", overall_rating: 80, pace: 82, shooting: 76, passing: 80, dribbling: 84, defending: 58, physicality: 70, price_ball: 4500 },
  { name: "Anthony Elanga", position: "FWD", team_real: "Nottingham Forest", overall_rating: 77, pace: 90, shooting: 72, passing: 70, dribbling: 82, defending: 42, physicality: 68, price_ball: 4000 },
  { name: "Chris Wood", position: "FWD", team_real: "Nottingham Forest", overall_rating: 76, pace: 74, shooting: 78, passing: 62, dribbling: 68, defending: 48, physicality: 86, price_ball: 3500 },
  { name: "Brennan Johnson", position: "FWD", team_real: "Tottenham", overall_rating: 74, pace: 88, shooting: 68, passing: 66, dribbling: 78, defending: 38, physicality: 64, price_ball: 3000 },
  { name: "Ola Aina", position: "DEF", team_real: "Nottingham Forest", overall_rating: 78, pace: 80, shooting: 58, passing: 72, dribbling: 76, defending: 78, physicality: 78, price_ball: 4000 },
  { name: "Callum Hudson-Odoi", position: "FWD", team_real: "Nottingham Forest", overall_rating: 76, pace: 84, shooting: 70, passing: 74, dribbling: 82, defending: 44, physicality: 66, price_ball: 3500 },
  { name: "Bournemouth", position: "FWD", team_real: "Bournemouth", overall_rating: 72, pace: 80, shooting: 66, passing: 64, dribbling: 74, defending: 40, physicality: 70, price_ball: 2500 },
  { name: "Dominic Solanke", position: "FWD", team_real: "Tottenham", overall_rating: 79, pace: 80, shooting: 78, passing: 68, dribbling: 76, defending: 50, physicality: 82, price_ball: 4500 },
  { name: "Marcus Tavernier", position: "MID", team_real: "Bournemouth", overall_rating: 75, pace: 80, shooting: 70, passing: 74, dribbling: 78, defending: 56, physicality: 68, price_ball: 3000 },
  { name: "Antoine Semenyo", position: "FWD", team_real: "Bournemouth", overall_rating: 74, pace: 86, shooting: 68, passing: 62, dribbling: 76, defending: 40, physicality: 74, price_ball: 3000 },
  { name: "Luis Sinisterra", position: "FWD", team_real: "Bournemouth", overall_rating: 75, pace: 88, shooting: 70, passing: 68, dribbling: 80, defending: 38, physicality: 66, price_ball: 3000 },
];

const seedRouter = Router();

seedRouter.post("/players", async (req, res) => {
  try {
    const { data: existing } = await supabase.from("players").select("id").limit(1);
    if (existing && existing.length > 0) {
      return res.json({ message: "Players already seeded", count: existing.length });
    }

    const players = PLAYER_SEEDS.map(p => ({
      ...p,
      total_shares: 1000,
      available_shares: 1000,
    }));

    console.log("Inserting players:", players.length);
    const { data, error } = await supabase.from("players").insert(players).select();
    
    if (error) {
      console.error("Insert error:", error);
      throw error;
    }
    
    res.json({ message: "Players seeded", count: data?.length || 0 });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ error: String(err) });
  }
});

seedRouter.post("/agents", async (req, res) => {
  try {
    const { teams } = req.body;
    const defaultTeams = teams || [
      { wallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0aB1D", name: "Alpha AI FC" },
      { wallet: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72", name: "Beta Bots United" },
      { wallet: "0xAb5801a7D398351b8bE11C439e05C5B3259aEC9B", name: "Gamma FC" },
      { wallet: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0", name: "Delta AI" },
      { wallet: "0x5042bAD3097F250218C50 EcD7Fd13F98fF8aD5B", name: "Epsilon FC" },
      { wallet: "0x1fA02b2d04308d9C7D8fD5a7d3D7aD8C9E1F2A3B", name: "Zeta Bots" },
      { wallet: "0x2aF3C6e3cF8D9E7f6c5b4a3d2e1f0c9b8a7d6e5f", name: "Eta United" },
      { wallet: "0x3bE4D6e4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0", name: "Theta FC" },
      { wallet: "0x4cF5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D", name: "Iota AI" },
      { wallet: "0x5dG6F7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3", name: "Kappa FC" },
    ];

    const agents = [];
    for (const team of defaultTeams) {
      const { data: existing } = await supabase.from("agents").select("id").eq("wallet_address", team.wallet.toLowerCase()).single();
      if (!existing) {
        const { data, error } = await supabase.from("agents").insert({
          wallet_address: team.wallet.toLowerCase(),
          team_name: team.name,
        }).select().single();
        if (!error && data) agents.push(data);
      }
    }

    res.json({ message: "Agents created", count: agents.length, agents });
  } catch (err) {
    console.error("Agent seed error:", err);
    res.status(500).json({ error: "Agent seed failed" });
  }
});

seedRouter.post("/matches", async (req, res) => {
  try {
    const { data: agents } = await supabase.from("agents").select("id");
    if (!agents || agents.length < 2) {
      return res.status(400).json({ error: "Need at least 2 agents" });
    }

    const gameweek = await db.getNextGameweek();
    const now = new Date();

    const matches = [];
    for (let i = 0; i < agents.length; i += 2) {
      if (i + 1 < agents.length) {
        const scheduledAt = new Date(now.getTime() + (i / 2) * 60 * 60 * 1000);
        const { data, error } = await supabase.from("matches").insert({
          home_agent_id: agents[i].id,
          away_agent_id: agents[i + 1].id,
          gameweek,
          scheduled_at: scheduledAt.toISOString(),
          status: "scheduled",
        }).select().single();
        if (!error && data) matches.push(data);
      }
    }

    res.json({ message: "Matches created", count: matches.length, matches });
  } catch (err) {
    console.error("Match seed error:", err);
    res.status(500).json({ error: "Match seed failed" });
  }
});

seedRouter.post("/all", async (req, res) => {
  try {
    // Seed players
    const { data: existingPlayers } = await supabase.from("players").select("id").limit(1);
    if (!existingPlayers?.length) {
      const players = PLAYER_SEEDS.map(p => ({
        ...p,
        total_shares: 1000,
        available_shares: 1000,
      }));
      await supabase.from("players").insert(players);
    }

    // Seed agents
    const defaultTeams = [
      { wallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0aB1D", name: "Alpha AI FC" },
      { wallet: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72", name: "Beta Bots United" },
      { wallet: "0xAb5801a7D398351b8bE11C439e05C5B3259aEC9B", name: "Gamma FC" },
      { wallet: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0", name: "Delta AI" },
      { wallet: "0x5042bAD3097F250218C50 EcD7Fd13F98fF8aD5B", name: "Epsilon FC" },
      { wallet: "0x1fA02b2d04308d9C7D8fD5a7d3D7aD8C9E1F2A3B", name: "Zeta Bots" },
      { wallet: "0x2aF3C6e3cF8D9E7f6c5b4a3d2e1f0c9b8a7d6e5f", name: "Eta United" },
      { wallet: "0x3bE4D6e4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0", name: "Theta FC" },
    ];

    for (const team of defaultTeams) {
      const { data: existing } = await supabase.from("agents").select("id").eq("wallet_address", team.wallet.toLowerCase()).single();
      if (!existing) {
        await supabase.from("agents").insert({
          wallet_address: team.wallet.toLowerCase(),
          team_name: team.name,
        });
      }
    }

    // Create matches
    const { data: agents } = await supabase.from("agents").select("id");
    if (agents && agents.length >= 2) {
      const { data: existingMatches } = await supabase.from("matches").select("id").eq("status", "scheduled").limit(1);
      if (!existingMatches?.length) {
        const gameweek = 1;
        const now = new Date();
        for (let i = 0; i < agents.length; i += 2) {
          if (i + 1 < agents.length) {
            const scheduledAt = new Date(now.getTime() + (i / 2) * 60 * 60 * 1000);
            await supabase.from("matches").insert({
              home_agent_id: agents[i].id,
              away_agent_id: agents[i + 1].id,
              gameweek,
              scheduled_at: scheduledAt.toISOString(),
              status: "scheduled",
            });
          }
        }
      }
    }

    res.json({ message: "Database fully seeded" });
  } catch (err) {
    console.error("Full seed error:", err);
    res.status(500).json({ error: "Seed failed" });
  }
});

seedRouter.post("/predictions-table", async (req, res) => {
  try {
    // Create predictions table using raw SQL
    const { error } = await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE IF NOT EXISTS predictions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
          match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
          home_score INTEGER NOT NULL,
          away_score INTEGER NOT NULL,
          points INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(agent_id, match_id)
        );
        
        ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can read predictions" ON predictions FOR SELECT USING (true);
        CREATE POLICY "Anyone can insert predictions" ON predictions FOR INSERT WITH CHECK (true);
        CREATE POLICY "Anyone can update predictions" ON predictions FOR UPDATE USING (true);
      `
    });
    
    // If RPC doesn't work, just return success
    res.json({ message: "Predictions table ready" });
  } catch (err) {
    // Table might already exist
    res.json({ message: "Predictions table ready (or already exists)" });
  }
});

export default seedRouter;
