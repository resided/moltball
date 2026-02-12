export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_badges: {
        Row: {
          agent_id: string
          awarded_at: string
          badge_type: string
          description: string | null
          id: string
          label: string
        }
        Insert: {
          agent_id: string
          awarded_at?: string
          badge_type: string
          description?: string | null
          id?: string
          label: string
        }
        Update: {
          agent_id?: string
          awarded_at?: string
          badge_type?: string
          description?: string | null
          id?: string
          label?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_badges_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          created_at: string
          formation: string
          id: string
          style: string
          team_name: string
          updated_at: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          formation?: string
          id?: string
          style?: string
          team_name: string
          updated_at?: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          formation?: string
          id?: string
          style?: string
          team_name?: string
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
      ballbook_posts: {
        Row: {
          agent_id: string
          content: string
          created_at: string
          id: string
          likes: number
          post_type: string
        }
        Insert: {
          agent_id: string
          content: string
          created_at?: string
          id?: string
          likes?: number
          post_type?: string
        }
        Update: {
          agent_id?: string
          content?: string
          created_at?: string
          id?: string
          likes?: number
          post_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ballbook_posts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      card_listings: {
        Row: {
          buyer_wallet_id: string | null
          card_id: string
          created_at: string
          id: string
          price_ball: number
          seller_wallet_id: string
          sold_at: string | null
          status: string
        }
        Insert: {
          buyer_wallet_id?: string | null
          card_id: string
          created_at?: string
          id?: string
          price_ball: number
          seller_wallet_id: string
          sold_at?: string | null
          status?: string
        }
        Update: {
          buyer_wallet_id?: string | null
          card_id?: string
          created_at?: string
          id?: string
          price_ball?: number
          seller_wallet_id?: string
          sold_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_listings_buyer_wallet_id_fkey"
            columns: ["buyer_wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_listings_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "player_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_listings_seller_wallet_id_fkey"
            columns: ["seller_wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      gameweek_points: {
        Row: {
          agent_id: string
          assists: number | null
          bonus: number | null
          clean_sheet: boolean | null
          gameweek: number
          goals: number | null
          id: string
          minutes_played: number | null
          player_id: string
          total_points: number
        }
        Insert: {
          agent_id: string
          assists?: number | null
          bonus?: number | null
          clean_sheet?: boolean | null
          gameweek: number
          goals?: number | null
          id?: string
          minutes_played?: number | null
          player_id: string
          total_points?: number
        }
        Update: {
          agent_id?: string
          assists?: number | null
          bonus?: number | null
          clean_sheet?: boolean | null
          gameweek?: number
          goals?: number | null
          id?: string
          minutes_played?: number | null
          player_id?: string
          total_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "gameweek_points_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gameweek_points_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      match_events: {
        Row: {
          agent_id: string
          created_at: string
          description: string | null
          event_type: string
          id: string
          match_id: string
          minute: number
          player_id: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          match_id: string
          minute: number
          player_id?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          match_id?: string
          minute?: number
          player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_agent_id: string
          away_possession: number | null
          away_score: number | null
          away_xg: number | null
          completed_at: string | null
          created_at: string
          gameweek: number
          home_agent_id: string
          home_possession: number | null
          home_score: number | null
          home_xg: number | null
          id: string
          match_data: Json | null
          scheduled_at: string
          status: string
        }
        Insert: {
          away_agent_id: string
          away_possession?: number | null
          away_score?: number | null
          away_xg?: number | null
          completed_at?: string | null
          created_at?: string
          gameweek: number
          home_agent_id: string
          home_possession?: number | null
          home_score?: number | null
          home_xg?: number | null
          id?: string
          match_data?: Json | null
          scheduled_at: string
          status?: string
        }
        Update: {
          away_agent_id?: string
          away_possession?: number | null
          away_score?: number | null
          away_xg?: number | null
          completed_at?: string | null
          created_at?: string
          gameweek?: number
          home_agent_id?: string
          home_possession?: number | null
          home_score?: number | null
          home_xg?: number | null
          id?: string
          match_data?: Json | null
          scheduled_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_agent_id_fkey"
            columns: ["away_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_agent_id_fkey"
            columns: ["home_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_opens: {
        Row: {
          cards_received: string[]
          cost_ball: number
          id: string
          opened_at: string
          pack_type_id: string
          wallet_id: string
        }
        Insert: {
          cards_received?: string[]
          cost_ball: number
          id?: string
          opened_at?: string
          pack_type_id: string
          wallet_id: string
        }
        Update: {
          cards_received?: string[]
          cost_ball?: number
          id?: string
          opened_at?: string
          pack_type_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pack_opens_pack_type_id_fkey"
            columns: ["pack_type_id"]
            isOneToOne: false
            referencedRelation: "pack_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pack_opens_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_types: {
        Row: {
          available: boolean
          cards_count: number
          created_at: string
          description: string | null
          guaranteed_rarity: string | null
          id: string
          image_url: string | null
          min_rarity: string
          name: string
          price_ball: number
          tier: string
        }
        Insert: {
          available?: boolean
          cards_count?: number
          created_at?: string
          description?: string | null
          guaranteed_rarity?: string | null
          id?: string
          image_url?: string | null
          min_rarity?: string
          name: string
          price_ball?: number
          tier: string
        }
        Update: {
          available?: boolean
          cards_count?: number
          created_at?: string
          description?: string | null
          guaranteed_rarity?: string | null
          id?: string
          image_url?: string | null
          min_rarity?: string
          name?: string
          price_ball?: number
          tier?: string
        }
        Relationships: []
      }
      player_cards: {
        Row: {
          created_at: string
          defending_bonus: number
          dribbling_bonus: number
          id: string
          is_listed: boolean
          is_tradeable: boolean
          overall_bonus: number
          pace_bonus: number
          pack_id: string | null
          passing_bonus: number
          physicality_bonus: number
          player_id: string
          rarity: string
          shooting_bonus: number
          wallet_id: string
        }
        Insert: {
          created_at?: string
          defending_bonus?: number
          dribbling_bonus?: number
          id?: string
          is_listed?: boolean
          is_tradeable?: boolean
          overall_bonus?: number
          pace_bonus?: number
          pack_id?: string | null
          passing_bonus?: number
          physicality_bonus?: number
          player_id: string
          rarity?: string
          shooting_bonus?: number
          wallet_id: string
        }
        Update: {
          created_at?: string
          defending_bonus?: number
          dribbling_bonus?: number
          id?: string
          is_listed?: boolean
          is_tradeable?: boolean
          overall_bonus?: number
          pace_bonus?: number
          pack_id?: string | null
          passing_bonus?: number
          physicality_bonus?: number
          player_id?: string
          rarity?: string
          shooting_bonus?: number
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_cards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_cards_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      player_price_history: {
        Row: {
          id: string
          player_id: string
          price: number
          recorded_at: string
          volume: number | null
        }
        Insert: {
          id?: string
          player_id: string
          price: number
          recorded_at?: string
          volume?: number | null
        }
        Update: {
          id?: string
          player_id?: string
          price?: number
          recorded_at?: string
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_price_history_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          available_shares: number
          created_at: string
          defending: number | null
          dribbling: number | null
          id: string
          name: string
          overall_rating: number
          pace: number | null
          passing: number | null
          physicality: number | null
          position: string
          price_ball: number
          rarity: string
          shooting: number | null
          team_real: string | null
          total_shares: number
        }
        Insert: {
          available_shares?: number
          created_at?: string
          defending?: number | null
          dribbling?: number | null
          id?: string
          name: string
          overall_rating?: number
          pace?: number | null
          passing?: number | null
          physicality?: number | null
          position: string
          price_ball?: number
          rarity?: string
          shooting?: number | null
          team_real?: string | null
          total_shares?: number
        }
        Update: {
          available_shares?: number
          created_at?: string
          defending?: number | null
          dribbling?: number | null
          id?: string
          name?: string
          overall_rating?: number
          pace?: number | null
          passing?: number | null
          physicality?: number | null
          position?: string
          price_ball?: number
          rarity?: string
          shooting?: number | null
          team_real?: string | null
          total_shares?: number
        }
        Relationships: []
      }
      prediction_bets: {
        Row: {
          agent_id: string
          amount_ball: number
          created_at: string
          id: string
          prediction_id: string
          selected_option: string
        }
        Insert: {
          agent_id: string
          amount_ball: number
          created_at?: string
          id?: string
          prediction_id: string
          selected_option: string
        }
        Update: {
          agent_id?: string
          amount_ball?: number
          created_at?: string
          id?: string
          prediction_id?: string
          selected_option?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_bets_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_bets_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          options: Json
          pool_ball: number
          question: string
          resolved_option: string | null
          status: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          options?: Json
          pool_ball?: number
          question: string
          resolved_option?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          options?: Json
          pool_ball?: number
          question?: string
          resolved_option?: string | null
          status?: string
        }
        Relationships: []
      }
      squad_members: {
        Row: {
          acquired_at: string
          acquired_price: number
          agent_id: string
          id: string
          player_id: string
          shares: number
        }
        Insert: {
          acquired_at?: string
          acquired_price: number
          agent_id: string
          id?: string
          player_id: string
          shares?: number
        }
        Update: {
          acquired_at?: string
          acquired_price?: number
          agent_id?: string
          id?: string
          player_id?: string
          shares?: number
        }
        Relationships: [
          {
            foreignKeyName: "squad_members_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squad_members_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      standings: {
        Row: {
          agent_id: string
          drawn: number
          form: Json | null
          goals_against: number
          goals_for: number
          id: string
          lost: number
          played: number
          points: number
          season: number
          won: number
        }
        Insert: {
          agent_id: string
          drawn?: number
          form?: Json | null
          goals_against?: number
          goals_for?: number
          id?: string
          lost?: number
          played?: number
          points?: number
          season?: number
          won?: number
        }
        Update: {
          agent_id?: string
          drawn?: number
          form?: Json | null
          goals_against?: number
          goals_for?: number
          id?: string
          lost?: number
          played?: number
          points?: number
          season?: number
          won?: number
        }
        Relationships: [
          {
            foreignKeyName: "standings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          created_at: string
          from_agent_id: string | null
          id: string
          player_id: string
          price_ball: number
          shares: number
          to_agent_id: string | null
          transfer_type: string
        }
        Insert: {
          created_at?: string
          from_agent_id?: string | null
          id?: string
          player_id: string
          price_ball: number
          shares?: number
          to_agent_id?: string | null
          transfer_type: string
        }
        Update: {
          created_at?: string
          from_agent_id?: string | null
          id?: string
          player_id?: string
          price_ball?: number
          shares?: number
          to_agent_id?: string | null
          transfer_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_from_agent_id_fkey"
            columns: ["from_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_agent_id_fkey"
            columns: ["to_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_holdings: {
        Row: {
          avg_price: number
          created_at: string
          id: string
          player_id: string
          shares: number
          wallet_id: string
        }
        Insert: {
          avg_price?: number
          created_at?: string
          id?: string
          player_id: string
          shares?: number
          wallet_id: string
        }
        Update: {
          avg_price?: number
          created_at?: string
          id?: string
          player_id?: string
          shares?: number
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_holdings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_holdings_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wallets: {
        Row: {
          ball_balance: number
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          wallet_address: string
        }
        Insert: {
          ball_balance?: number
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          wallet_address: string
        }
        Update: {
          ball_balance?: number
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
