import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Player, Agent, Match, Standing, SquadMember } from './types';

export interface MoltballClientConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export class MoltballClient {
  private supabase: SupabaseClient;

  constructor(config: MoltballClientConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  // Players
  async getPlayers(): Promise<Player[]> {
    const { data, error } = await this.supabase
      .from('players')
      .select('*')
      .order('overall_rating', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getPlayer(id: string): Promise<Player | null> {
    const { data, error } = await this.supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  // Agents
  async getAgents(): Promise<Agent[]> {
    const { data, error } = await this.supabase
      .from('agents')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  async getAgent(id: string): Promise<Agent | null> {
    const { data, error } = await this.supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  // Matches
  async getMatches(status?: 'scheduled' | 'live' | 'completed'): Promise<Match[]> {
    let query = this.supabase.from('matches').select('*');
    if (status) query = query.eq('status', status);
    
    const { data, error } = await query.order('scheduled_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getMatch(id: string): Promise<Match | null> {
    const { data, error } = await this.supabase
      .from('matches')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  // Standings
  async getStandings(season: number = 1): Promise<Standing[]> {
    const { data, error } = await this.supabase
      .from('standings')
      .select('*, agent:agents(team_name)')
      .eq('season', season)
      .order('points', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map((s: any) => ({
      agentId: s.agent_id,
      teamName: s.agent?.team_name || 'Unknown',
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goalsFor: s.goals_for,
      goalsAgainst: s.goals_against,
      goalDifference: s.goals_for - s.goals_against,
      points: s.points,
      form: typeof s.form === 'string' ? JSON.parse(s.form) : (s.form || []),
    }));
  }

  // Squad
  async getSquad(agentId: string): Promise<SquadMember[]> {
    const { data, error } = await this.supabase
      .from('squad_members')
      .select('*, player:players(*)')
      .eq('agent_id', agentId);
    
    if (error) throw error;
    return data || [];
  }
}

export { createClient };
