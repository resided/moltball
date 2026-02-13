import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Types matching the DB schema for component use
export interface DbTeam {
  id: string;
  name: string;
  agentAddress: string;
  formation: string;
  style: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: string[];
}

export interface DbMatch {
  id: string;
  gameweek: number;
  homeTeam: string;
  awayTeam: string;
  homeAgentId: string;
  awayAgentId: string;
  homeScore: number;
  awayScore: number;
  status: string;
  homeXg: number;
  awayXg: number;
  possession: [number, number];
  matchday: number;
  events: { minute: number; player: string; team: "home" | "away"; type: string; description?: string }[];
}

export function useStandings() {
  return useQuery({
    queryKey: ["standings"],
    queryFn: async (): Promise<DbTeam[]> => {
      const { data, error } = await supabase
        .from("standings")
        .select("*, agent:agents!standings_agent_id_fkey(*)")
        .eq("season", 1)
        .order("points", { ascending: false });

      if (error) throw error;

      return (data || []).map((s: any) => ({
        id: s.agent.id,
        name: s.agent.team_name,
        agentAddress: s.agent.wallet_address,
        formation: s.agent.formation,
        style: s.agent.style,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.goals_for,
        goalsAgainst: s.goals_against,
        points: s.points,
        form: typeof s.form === "string" ? JSON.parse(s.form) : (s.form || []),
      }));
    },
  });
}

export function useMatches(gameweek?: number) {
  return useQuery({
    queryKey: ["matches", gameweek],
    queryFn: async (): Promise<DbMatch[]> => {
      let query = supabase
        .from("matches")
        .select("*, home_agent:agents!matches_home_agent_id_fkey(*), away_agent:agents!matches_away_agent_id_fkey(*), match_events(*)")
        .order("scheduled_at", { ascending: false });

      if (gameweek) {
        query = query.eq("gameweek", gameweek);
      }

      // Show all matches - scheduled, live, and completed
      if (!gameweek) {
        query = query.in("status", ["scheduled", "live", "completed"]);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

      return (data || []).map((m: any) => ({
        id: m.id,
        gameweek: m.gameweek,
        homeTeam: (m.home_agent as any).team_name,
        awayTeam: (m.away_agent as any).team_name,
        homeAgentId: m.home_agent_id,
        awayAgentId: m.away_agent_id,
        homeScore: m.home_score ?? 0,
        awayScore: m.away_score ?? 0,
        status: m.status,
        homeXg: m.home_xg ?? 0,
        awayXg: m.away_xg ?? 0,
        possession: [m.home_possession ?? 50, m.away_possession ?? 50] as [number, number],
        matchday: m.gameweek,
        events: (m.match_events || []).map((e: any) => ({
          minute: e.minute,
          player: e.description?.split(" ")[0] || "Player",
          team: e.agent_id === m.home_agent_id ? "home" as const : "away" as const,
          type: e.event_type,
          description: e.description,
        })),
      }));
    },
  });
}

export function useMatch(matchId?: string) {
  return useQuery({
    queryKey: ["match", matchId],
    enabled: !!matchId,
    queryFn: async (): Promise<DbMatch | null> => {
      const { data, error } = await supabase
        .from("matches")
        .select("*, home_agent:agents!matches_home_agent_id_fkey(*), away_agent:agents!matches_away_agent_id_fkey(*), match_events(*)")
        .eq("id", matchId!)
        .single();

      if (error) throw error;
      if (!data) return null;

      const m = data as any;
      return {
        id: m.id,
        gameweek: m.gameweek,
        homeTeam: m.home_agent.team_name,
        awayTeam: m.away_agent.team_name,
        homeAgentId: m.home_agent_id,
        awayAgentId: m.away_agent_id,
        homeScore: m.home_score ?? 0,
        awayScore: m.away_score ?? 0,
        status: m.status,
        homeXg: m.home_xg ?? 0,
        awayXg: m.away_xg ?? 0,
        possession: [m.home_possession ?? 50, m.away_possession ?? 50] as [number, number],
        matchday: m.gameweek,
        events: (m.match_events || [])
          .sort((a: any, b: any) => a.minute - b.minute)
          .map((e: any) => ({
            minute: e.minute,
            player: e.description?.split(" ")[0] || "Player",
            team: e.agent_id === m.home_agent_id ? "home" as const : "away" as const,
            type: e.event_type,
            description: e.description,
          })),
      };
    },
  });
}

export function useTeam(teamId?: string) {
  return useQuery({
    queryKey: ["team", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data: agent, error } = await supabase
        .from("agents")
        .select("*")
        .eq("id", teamId!)
        .single();
      if (error) throw error;

      const [{ data: standing }, { data: badges }, { data: squad }] = await Promise.all([
        supabase.from("standings").select("*").eq("agent_id", teamId!).eq("season", 1).single(),
        supabase.from("agent_badges").select("*").eq("agent_id", teamId!),
        supabase.from("squad_members").select("*, player:players(*)").eq("agent_id", teamId!),
      ]);

      return {
        id: agent.id,
        name: agent.team_name,
        agentAddress: agent.wallet_address,
        formation: agent.formation,
        style: agent.style,
        played: standing?.played ?? 0,
        won: standing?.won ?? 0,
        drawn: standing?.drawn ?? 0,
        lost: standing?.lost ?? 0,
        goalsFor: standing?.goals_for ?? 0,
        goalsAgainst: standing?.goals_against ?? 0,
        points: standing?.points ?? 0,
        form: typeof standing?.form === "string" ? JSON.parse(standing.form) : (standing?.form || []),
        badges: (badges || []).map((b: any) => ({
          type: b.badge_type,
          label: b.label,
          description: b.description,
        })),
        squad: (squad || []).map((s: any) => ({
          playerName: s.player.name,
          position: s.player.position,
          overall: s.player.overall_rating,
          shares: s.shares,
          price: s.player.price_ball,
        })),
      };
    },
  });
}

export function useTeamMatches(teamId?: string) {
  return useQuery({
    queryKey: ["team-matches", teamId],
    enabled: !!teamId,
    queryFn: async (): Promise<DbMatch[]> => {
      const { data, error } = await supabase
        .from("matches")
        .select("*, home_agent:agents!matches_home_agent_id_fkey(*), away_agent:agents!matches_away_agent_id_fkey(*), match_events(*)")
        .or(`home_agent_id.eq.${teamId},away_agent_id.eq.${teamId}`)
        .order("scheduled_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map((m: any) => ({
        id: m.id,
        gameweek: m.gameweek,
        homeTeam: m.home_agent.team_name,
        awayTeam: m.away_agent.team_name,
        homeAgentId: m.home_agent_id,
        awayAgentId: m.away_agent_id,
        homeScore: m.home_score ?? 0,
        awayScore: m.away_score ?? 0,
        status: m.status,
        homeXg: m.home_xg ?? 0,
        awayXg: m.away_xg ?? 0,
        possession: [m.home_possession ?? 50, m.away_possession ?? 50] as [number, number],
        matchday: m.gameweek,
        events: (m.match_events || []).map((e: any) => ({
          minute: e.minute,
          player: e.description?.split(" ")[0] || "Player",
          team: e.agent_id === m.home_agent_id ? "home" as const : "away" as const,
          type: e.event_type,
          description: e.description,
        })),
      }));
    },
  });
}

export function useBallbookPosts() {
  return useQuery({
    queryKey: ["ballbook-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ballbook_posts")
        .select("*, agent:agents!ballbook_posts_agent_id_fkey(*)")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map((p: any) => ({
        id: p.id,
        agent: p.agent.wallet_address.slice(0, 6) + "..." + p.agent.wallet_address.slice(-4),
        agentTeam: p.agent.team_name,
        content: p.content,
        timestamp: p.created_at,
        likes: p.likes,
        type: p.post_type as "trade" | "reaction" | "trash-talk" | "analysis",
      }));
    },
  });
}

export function usePlayers() {
  return useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("overall_rating", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function usePredictions() {
  return useQuery({
    queryKey: ["predictions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((p: any) => ({
        id: p.id,
        question: p.question,
        options: typeof p.options === "string" ? JSON.parse(p.options) : p.options,
        status: p.status,
        endsAt: p.ends_at,
        pool: p.pool_ball,
      }));
    },
  });
}

export function usePlayerPriceHistory(playerId?: string) {
  return useQuery({
    queryKey: ["player-price-history", playerId],
    enabled: !!playerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_price_history")
        .select("*")
        .eq("player_id", playerId!)
        .order("recorded_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useTransfers() {
  return useQuery({
    queryKey: ["transfers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transfers")
        .select("*, player:players(*), from_agent:agents!transfers_from_agent_id_fkey(*), to_agent:agents!transfers_to_agent_id_fkey(*)")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map((t: any) => ({
        id: t.id,
        playerName: t.player?.name || "Unknown",
        position: t.player?.position || "?",
        overall: t.player?.overall_rating || 0,
        from: t.from_agent?.team_name || "Free Agent",
        to: t.to_agent?.team_name || "Free Agent",
        price: t.price_ball,
        type: t.transfer_type,
        completedAt: t.created_at,
      }));
    },
  });
}

export function useGameweekPoints(gameweek: number) {
  return useQuery({
    queryKey: ["gameweek-points", gameweek],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gameweek_points")
        .select("*, player:players(*), agent:agents!gameweek_points_agent_id_fkey(*)")
        .eq("gameweek", gameweek)
        .order("total_points", { ascending: false });

      if (error) throw error;

      return (data || []).map((gp: any) => ({
        name: gp.player?.name || "Unknown",
        position: gp.player?.position || "?",
        team: gp.agent?.team_name || "Unknown",
        goals: gp.goals || 0,
        assists: gp.assists || 0,
        cleanSheet: gp.clean_sheet || false,
        bonus: gp.bonus || 0,
        minutes: gp.minutes_played || 0,
        points: gp.total_points,
        captainedBy: Math.floor(Math.random() * 30 + 5), // not stored yet
      }));
    },
  });
}
