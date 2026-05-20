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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      active_sips: {
        Row: {
          bonus_reward: string | null
          completed_months: number
          created_at: string
          duration: number
          id: string
          metal: Database["public"]["Enums"]["metal_type"]
          monthly_amount: number
          next_due_date: string
          plan_id: string
          plan_name: string
          start_date: string
          status: string
          total_grams: number
          total_invested: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bonus_reward?: string | null
          completed_months?: number
          created_at?: string
          duration: number
          id?: string
          metal: Database["public"]["Enums"]["metal_type"]
          monthly_amount: number
          next_due_date: string
          plan_id: string
          plan_name: string
          start_date?: string
          status?: string
          total_grams?: number
          total_invested?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bonus_reward?: string | null
          completed_months?: number
          created_at?: string
          duration?: number
          id?: string
          metal?: Database["public"]["Enums"]["metal_type"]
          monthly_amount?: number
          next_due_date?: string
          plan_id?: string
          plan_name?: string
          start_date?: string
          status?: string
          total_grams?: number
          total_invested?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          id: string
          image_data: string
          is_active: boolean
          redirect_url: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_data: string
          is_active?: boolean
          redirect_url?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_data?: string
          is_active?: boolean
          redirect_url?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gifts: {
        Row: {
          created_at: string
          grams: number
          id: string
          message: string | null
          metal: Database["public"]["Enums"]["metal_type"]
          recipient_name: string
          recipient_phone: string
          sender_id: string
          status: string
        }
        Insert: {
          created_at?: string
          grams: number
          id?: string
          message?: string | null
          metal: Database["public"]["Enums"]["metal_type"]
          recipient_name: string
          recipient_phone: string
          sender_id: string
          status?: string
        }
        Update: {
          created_at?: string
          grams?: number
          id?: string
          message?: string | null
          metal?: Database["public"]["Enums"]["metal_type"]
          recipient_name?: string
          recipient_phone?: string
          sender_id?: string
          status?: string
        }
        Relationships: []
      }
      holdings: {
        Row: {
          grams: number
          id: string
          metal: Database["public"]["Enums"]["metal_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          grams?: number
          id?: string
          metal: Database["public"]["Enums"]["metal_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          grams?: number
          id?: string
          metal?: Database["public"]["Enums"]["metal_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investment_transactions: {
        Row: {
          amount_inr: number | null
          created_at: string
          grams: number | null
          gst_amount: number | null
          id: string
          metal: Database["public"]["Enums"]["metal_type"] | null
          notes: Json | null
          rate: number | null
          ref_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount_inr?: number | null
          created_at?: string
          grams?: number | null
          gst_amount?: number | null
          id?: string
          metal?: Database["public"]["Enums"]["metal_type"] | null
          notes?: Json | null
          rate?: number | null
          ref_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount_inr?: number | null
          created_at?: string
          grams?: number | null
          gst_amount?: number | null
          id?: string
          metal?: Database["public"]["Enums"]["metal_type"] | null
          notes?: Json | null
          rate?: number | null
          ref_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      kyc_details: {
        Row: {
          created_at: string
          date_of_birth: string
          first_name: string
          id: string
          last_name: string
          pan_number: string
          status: string
          updated_at: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date_of_birth: string
          first_name: string
          id?: string
          last_name: string
          pan_number: string
          status?: string
          updated_at?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string
          first_name?: string
          id?: string
          last_name?: string
          pan_number?: string
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      metal_prices: {
        Row: {
          created_at: string
          gold_22k: number
          gold_24k: number
          id: string
          silver: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          gold_22k?: number
          gold_24k?: number
          id?: string
          silver?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          gold_22k?: number
          gold_24k?: number
          id?: string
          silver?: number
          updated_at?: string
        }
        Relationships: []
      }
      nominees: {
        Row: {
          created_at: string
          id: string
          nominee_dob: string | null
          nominee_name: string
          nominee_pan: string | null
          nominee_phone: string | null
          percentage: number
          relationship: string
          updated_at: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nominee_dob?: string | null
          nominee_name: string
          nominee_pan?: string | null
          nominee_phone?: string | null
          percentage?: number
          relationship: string
          updated_at?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nominee_dob?: string | null
          nominee_name?: string
          nominee_pan?: string | null
          nominee_phone?: string | null
          percentage?: number
          relationship?: string
          updated_at?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          audience: string
          body: string
          category: string | null
          created_at: string
          id: string
          link: string | null
          metadata: Json | null
          read_by: string[]
          recipient_id: string | null
          sender_id: string | null
          title: string
        }
        Insert: {
          audience: string
          body: string
          category?: string | null
          created_at?: string
          id?: string
          link?: string | null
          metadata?: Json | null
          read_by?: string[]
          recipient_id?: string | null
          sender_id?: string | null
          title: string
        }
        Update: {
          audience?: string
          body?: string
          category?: string | null
          created_at?: string
          id?: string
          link?: string | null
          metadata?: Json | null
          read_by?: string[]
          recipient_id?: string | null
          sender_id?: string | null
          title?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          method: string | null
          notes: Json | null
          order_id: string
          payment_id: string | null
          signature: string | null
          status: string
          updated_at: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          method?: string | null
          notes?: Json | null
          order_id: string
          payment_id?: string | null
          signature?: string | null
          status?: string
          updated_at?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          method?: string | null
          notes?: Json | null
          order_id?: string
          payment_id?: string | null
          signature?: string | null
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          address: Json | null
          amount_inr: number | null
          created_at: string
          grams: number
          id: string
          metal: Database["public"]["Enums"]["metal_type"]
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: Json | null
          amount_inr?: number | null
          created_at?: string
          grams: number
          id?: string
          metal: Database["public"]["Enums"]["metal_type"]
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json | null
          amount_inr?: number | null
          created_at?: string
          grams?: number
          id?: string
          metal?: Database["public"]["Enums"]["metal_type"]
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      spin_history: {
        Row: {
          created_at: string
          id: string
          reward_amount: number
          reward_label: string
          spun_on: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reward_amount: number
          reward_label: string
          spun_on?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reward_amount?: number
          reward_label?: string
          spun_on?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          description: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
          welcome_bonus_applied: boolean
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          welcome_bonus_applied?: boolean
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          welcome_bonus_applied?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      credit_wallet_from_payment: {
        Args: { _amount: number; _order_id: string; _user_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      notify_admins: {
        Args: {
          _body: string
          _category: string
          _meta?: Json
          _title: string
          _user_id: string
        }
        Returns: undefined
      }
      process_investment: {
        Args: { _amount: number; _metal: string; _source?: string }
        Returns: Json
      }
      process_spin_reward: {
        Args: { _amount: number; _label: string }
        Returns: Json
      }
      process_withdrawal: {
        Args: { _amount: number; _description?: string }
        Returns: Json
      }
      send_notification: {
        Args: {
          _body: string
          _category?: string
          _link?: string
          _recipient_id?: string
          _title: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
      metal_type: "gold" | "silver"
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
    Enums: {
      app_role: ["admin", "user"],
      metal_type: ["gold", "silver"],
    },
  },
} as const
