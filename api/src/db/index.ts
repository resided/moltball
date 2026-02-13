import { createClient, SupabaseClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
// Use anon key as fallback - RLS should handle permissions
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(`Missing SUPABASE_URL or keys. Got URL: ${!!supabaseUrl}, Got Key: ${!!supabaseKey}`);
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

export { createClient } from "@supabase/supabase-js";

export interface Agent {
  id: string;
  wallet_address: string;
  team_name: string;
  formation: string;
  style: string;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  team_real: string | null;
  overall_rating: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physicality: number;
  price_ball: number;
  total_shares: number;
  available_shares: number;
  created_at: string;
}

export interface SquadMember {
  id: string;
  agent_id: string;
  player_id: string;
  shares: number;
  acquired_price: number;
  acquired_at: string;
  player?: Player;
}

export interface Match {
  id: string;
  gameweek: number;
  home_agent_id: string;
  away_agent_id: string;
  home_score: number | null;
  away_score: number | null;
  status: "scheduled" | "live" | "completed";
  home_xg: number;
  away_xg: number;
  home_possession: number;
  away_possession: number;
  match_data: Record<string, unknown>;
  scheduled_at: string;
  completed_at: string | null;
  created_at: string;
  home_agent?: Agent;
  away_agent?: Agent;
}

export interface Listing {
  id: string;
  player_id: string;
  agent_id: string;
  price_per_share: number;
  shares: number;
  status: "active" | "sold" | "cancelled";
  created_at: string;
  player?: Player;
  agent?: Agent;
}

export const db = {
  async getAgents(): Promise<Agent[]> {
    const { data } = await supabase.from("agents").select("*").order("team_name");
    return data || [];
  },

  async getAgentByWallet(wallet: string): Promise<Agent | null> {
    const { data } = await supabase
      .from("agents")
      .select("*")
      .eq("wallet_address", wallet.toLowerCase())
      .single();
    return data;
  },

  async getAgentById(id: string): Promise<Agent | null> {
    const { data } = await supabase.from("agents").select("*").eq("id", id).single();
    return data;
  },

  async createAgent(wallet: string, teamName: string): Promise<Agent> {
    const { data, error } = await supabase
      .from("agents")
      .insert({
        wallet_address: wallet.toLowerCase(),
        team_name: teamName,
        formation: "4-3-3",
        style: "balanced",
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    const { data, error } = await supabase
      .from("agents")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getPlayers(position?: string, limit = 100): Promise<Player[]> {
    let query = supabase.from("players").select("*").order("overall_rating", { ascending: false }).limit(limit);
    if (position) {
      query = query.eq("position", position);
    }
    const { data } = await query;
    return data || [];
  },

  async getPlayerById(id: string): Promise<Player | null> {
    const { data } = await supabase.from("players").select("*").eq("id", id).single();
    return data;
  },

  async getSquad(agentId: string): Promise<SquadMember[]> {
    const { data } = await supabase
      .from("squad_members")
      .select("*, player:players(*)")
      .eq("agent_id", agentId)
      .order("acquired_at", { ascending: false });
    return data || [];
  },

  async addPlayerToSquad(agentId: string, playerId: string, shares: number, price: number): Promise<SquadMember> {
    const { data: existing } = await supabase
      .from("squad_members")
      .select("*")
      .eq("agent_id", agentId)
      .eq("player_id", playerId)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from("squad_members")
        .update({ shares: existing.shares + shares })
        .eq("id", existing.id)
        .select("*, player:players(*)")
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from("squad_members")
      .insert({
        agent_id: agentId,
        player_id: playerId,
        shares,
        acquired_price: price,
      })
      .select("*, player:players(*)")
      .single();
    if (error) throw error;
    return data;
  },

  async getMatches(limit = 20, status?: string): Promise<Match[]> {
    let query = supabase
      .from("matches")
      .select("*, home_agent:agents!matches_home_agent_id_fkey(*), away_agent:agents!matches_away_agent_id_fkey(*)")
      .order("scheduled_at", { ascending: false })
      .limit(limit);
    
    if (status) {
      query = query.eq("status", status);
    }
    const { data } = await query;
    return data || [];
  },

  async getMatchById(id: string): Promise<Match | null> {
    const { data } = await supabase
      .from("matches")
      .select("*, home_agent:agents!matches_home_agent_id_fkey(*), away_agent:agents!matches_away_agent_id_fkey(*)")
      .eq("id", id)
      .single();
    return data;
  },

  async createMatch(homeAgentId: string, awayAgentId: string, gameweek: number, scheduledAt: string): Promise<Match> {
    const { data, error } = await supabase
      .from("matches")
      .insert({
        home_agent_id: homeAgentId,
        away_agent_id: awayAgentId,
        gameweek,
        scheduled_at: scheduledAt,
        status: "scheduled",
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateMatch(id: string, updates: Partial<Match>): Promise<Match> {
    const { data, error } = await supabase
      .from("matches")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getStandings(): Promise<{ agent: Agent; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; gd: number; points: number }[]> {
    const matches = await this.getMatches(1000, "completed");
    const agents = await this.getAgents();
    
    const standings: Record<string, { played: number; won: number; drawn: number; lost: number; gf: number; ga: number }> = {};
    
    for (const agent of agents) {
      standings[agent.id] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 };
    }
    
    for (const match of matches) {
      if (!match.home_agent_id || !match.away_agent_id) continue;
      
      const home = standings[match.home_agent_id];
      const away = standings[match.away_agent_id];
      if (!home || !away) continue;
      
      home.played++;
      away.played++;
      home.gf += match.home_score || 0;
      home.ga += match.away_score || 0;
      away.gf += match.away_score || 0;
      away.ga += match.home_score || 0;
      
      if ((match.home_score || 0) > (match.away_score || 0)) {
        home.won++;
        away.lost++;
      } else if ((match.home_score || 0) < (match.away_score || 0)) {
        away.won++;
        home.lost++;
      } else {
        home.drawn++;
        away.drawn++;
      }
    }
    
    return agents.map((agent) => {
      const s = standings[agent.id] || { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 };
      return {
        agent,
        ...s,
        gd: s.gf - s.ga,
        points: s.won * 3 + s.drawn,
      };
    }).sort((a, b) => b.points - a.points || b.gd - a.gd);
  },

  async getSeasonInfo(): Promise<{ currentGameweek: number; totalGameweeks: number; matches: Match[] }> {
    const matches = await this.getMatches(100, "completed");
    const maxCompleted = Math.max(...matches.map(m => m.gameweek), 0);
    
    return {
      currentGameweek: maxCompleted,
      totalGameweeks: 38,
      matches,
    };
  },

  async getListings(playerId?: string, limit = 50): Promise<Listing[]> {
    let query = supabase
      .from("listings")
      .select("*, player:players(*), agent:agents(*)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (playerId) {
      query = query.eq("player_id", playerId);
    }
    
    const { data } = await query;
    return data || [];
  },

  async createListing(agentId: string, playerId: string, pricePerShare: number, shares: number): Promise<Listing> {
    const { data, error } = await supabase
      .from("listings")
      .insert({
        agent_id: agentId,
        player_id: playerId,
        price_per_share: pricePerShare,
        shares,
        status: "active",
      })
      .select("*, player:players(*)")
      .single();
    if (error) throw error;
    return data;
  },

  async getNextGameweek(): Promise<number> {
    const { data } = await supabase
      .from("matches")
      .select("gameweek")
      .order("gameweek", { ascending: false })
      .limit(1)
      .single();
    return (data?.gameweek || 0) + 1;
  },
};
