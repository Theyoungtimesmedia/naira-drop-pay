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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      conversion_rates: {
        Row: {
          country_code: string
          currency: string
          currency_symbol: string
          id: string
          rate_to_usd: number
          updated_at: string | null
        }
        Insert: {
          country_code: string
          currency: string
          currency_symbol: string
          id?: string
          rate_to_usd: number
          updated_at?: string | null
        }
        Update: {
          country_code?: string
          currency?: string
          currency_symbol?: string
          id?: string
          rate_to_usd?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount_usd_cents: number
          confirmed_at: string | null
          created_at: string | null
          currency: string | null
          gateway_ref: string | null
          id: string
          local_amount_cents: number | null
          method: string
          plan_id: string
          screenshot_url: string | null
          status: string
          tx_hash: string | null
          user_id: string
        }
        Insert: {
          amount_usd_cents: number
          confirmed_at?: string | null
          created_at?: string | null
          currency?: string | null
          gateway_ref?: string | null
          id?: string
          local_amount_cents?: number | null
          method: string
          plan_id: string
          screenshot_url?: string | null
          status?: string
          tx_hash?: string | null
          user_id: string
        }
        Update: {
          amount_usd_cents?: number
          confirmed_at?: string | null
          created_at?: string | null
          currency?: string | null
          gateway_ref?: string | null
          id?: string
          local_amount_cents?: number | null
          method?: string
          plan_id?: string
          screenshot_url?: string | null
          status?: string
          tx_hash?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      gateway_logs: {
        Row: {
          created_at: string | null
          deposit_id: string | null
          id: string
          payload: Json | null
          type: string
          withdrawal_id: string | null
        }
        Insert: {
          created_at?: string | null
          deposit_id?: string | null
          id?: string
          payload?: Json | null
          type: string
          withdrawal_id?: string | null
        }
        Update: {
          created_at?: string | null
          deposit_id?: string | null
          id?: string
          payload?: Json | null
          type?: string
          withdrawal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gateway_logs_deposit_id_fkey"
            columns: ["deposit_id"]
            isOneToOne: false
            referencedRelation: "deposits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gateway_logs_withdrawal_id_fkey"
            columns: ["withdrawal_id"]
            isOneToOne: false
            referencedRelation: "withdrawals"
            referencedColumns: ["id"]
          },
        ]
      }
      income_events: {
        Row: {
          amount_cents: number
          created_at: string | null
          deposit_id: string
          drop_number: number
          due_at: string
          id: string
          processed_at: string | null
          processed_bool: boolean | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          deposit_id: string
          drop_number: number
          due_at: string
          id?: string
          processed_at?: string | null
          processed_bool?: boolean | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          deposit_id?: string
          drop_number?: number
          due_at?: string
          id?: string
          processed_at?: string | null
          processed_bool?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_events_deposit_id_fkey"
            columns: ["deposit_id"]
            isOneToOne: false
            referencedRelation: "deposits"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs_log: {
        Row: {
          created_at: string | null
          id: string
          job: string
          payload: Json | null
          processed_count: number | null
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job: string
          payload?: Json | null
          processed_count?: number | null
          status: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job?: string
          payload?: Json | null
          processed_count?: number | null
          status?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string | null
          deposit_usd: number
          drops_count: number
          id: string
          is_locked: boolean | null
          name: string
          payout_per_drop_usd: number
          sort_order: number | null
          total_return_usd: number
        }
        Insert: {
          created_at?: string | null
          deposit_usd: number
          drops_count: number
          id?: string
          is_locked?: boolean | null
          name: string
          payout_per_drop_usd: number
          sort_order?: number | null
          total_return_usd: number
        }
        Update: {
          created_at?: string | null
          deposit_usd?: number
          drops_count?: number
          id?: string
          is_locked?: boolean | null
          name?: string
          payout_per_drop_usd?: number
          sort_order?: number | null
          total_return_usd?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auto_withdraw_enabled: boolean | null
          avatar_url: string | null
          country: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          referral_code: string | null
          referrer_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_withdraw_enabled?: boolean | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          referral_code?: string | null
          referrer_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_withdraw_enabled?: boolean | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          referral_code?: string | null
          referrer_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          bonus_cents: number
          created_at: string | null
          deposit_id: string | null
          id: string
          level: number
          referred_id: string
          referrer_id: string
        }
        Insert: {
          bonus_cents: number
          created_at?: string | null
          deposit_id?: string | null
          id?: string
          level: number
          referred_id: string
          referrer_id: string
        }
        Update: {
          bonus_cents?: number
          created_at?: string | null
          deposit_id?: string | null
          id?: string
          level?: number
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_deposit_id_fkey"
            columns: ["deposit_id"]
            isOneToOne: false
            referencedRelation: "deposits"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount_cents: number
          created_at: string | null
          id: string
          meta: Json | null
          type: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          id?: string
          meta?: Json | null
          type: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          id?: string
          meta?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          available_cents: number | null
          created_at: string | null
          id: string
          pending_cents: number | null
          total_earned_cents: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_cents?: number | null
          created_at?: string | null
          id?: string
          pending_cents?: number | null
          total_earned_cents?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_cents?: number | null
          created_at?: string | null
          id?: string
          pending_cents?: number | null
          total_earned_cents?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount_cents: number
          created_at: string | null
          fee_cents: number
          id: string
          net_cents: number
          next_attempt: string | null
          processed_at: string | null
          retry_count: number | null
          status: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          fee_cents: number
          id?: string
          net_cents: number
          next_attempt?: string | null
          processed_at?: string | null
          retry_count?: number | null
          status?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          fee_cents?: number
          id?: string
          net_cents?: number
          next_attempt?: string | null
          processed_at?: string | null
          retry_count?: number | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reserve_withdrawal: {
        Args: { p_amount: number; p_fee: number; p_user_id: string }
        Returns: undefined
      }
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
