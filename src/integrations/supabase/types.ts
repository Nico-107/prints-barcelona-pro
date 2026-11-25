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
      checkout_recoveries: {
        Row: {
          created_at: string
          customer_email: string
          id: string
          language: string | null
          recovered: boolean
          recovered_session_id: string | null
          recovery_url: string | null
          sent_at: string
          stripe_session_id: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          id?: string
          language?: string | null
          recovered?: boolean
          recovered_session_id?: string | null
          recovery_url?: string | null
          sent_at?: string
          stripe_session_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          id?: string
          language?: string | null
          recovered?: boolean
          recovered_session_id?: string | null
          recovery_url?: string | null
          sent_at?: string
          stripe_session_id?: string
        }
        Relationships: []
      }
      maker_applications: {
        Row: {
          city: string
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          printers: string
        }
        Insert: {
          city: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          printers: string
        }
        Update: {
          city?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          printers?: string
        }
        Relationships: []
      }
      order_events: {
        Row: {
          actor: string | null
          created_at: string
          email_id: string | null
          id: string
          kind: string
          message: string | null
          order_id: string
          status: string | null
          visible_to_customer: boolean
        }
        Insert: {
          actor?: string | null
          created_at?: string
          email_id?: string | null
          id?: string
          kind: string
          message?: string | null
          order_id: string
          status?: string | null
          visible_to_customer?: boolean
        }
        Update: {
          actor?: string | null
          created_at?: string
          email_id?: string | null
          id?: string
          kind?: string
          message?: string | null
          order_id?: string
          status?: string | null
          visible_to_customer?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          carrier: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string
          delivered_at: string | null
          eta: string | null
          file_paths: string[]
          fulfillment: string
          id: string
          internal_notes: string
          label_url: string | null
          notes: string
          order_number: number
          payment_method: string | null
          payment_status: string
          phone_last3: string | null
          photos: string[]
          pieces: Json | null
          product_title: string
          shipment_ref: string | null
          shipped_at: string | null
          shipping_address: Json | null
          status: string
          stripe_payment_link: string | null
          total_paid_cents: number | null
          tracking_number: string | null
          tracking_token: string
          tracking_url: string | null
          updated_at: string
          uploaded_not_purchased: Json
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone: string
          delivered_at?: string | null
          eta?: string | null
          file_paths?: string[]
          fulfillment?: string
          id?: string
          internal_notes?: string
          label_url?: string | null
          notes?: string
          order_number?: number
          payment_method?: string | null
          payment_status?: string
          phone_last3?: string | null
          photos?: string[]
          pieces?: Json | null
          product_title?: string
          shipment_ref?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          status?: string
          stripe_payment_link?: string | null
          total_paid_cents?: number | null
          tracking_number?: string | null
          tracking_token?: string
          tracking_url?: string | null
          updated_at?: string
          uploaded_not_purchased?: Json
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          carrier?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string
          delivered_at?: string | null
          eta?: string | null
          file_paths?: string[]
          fulfillment?: string
          id?: string
          internal_notes?: string
          label_url?: string | null
          notes?: string
          order_number?: number
          payment_method?: string | null
          payment_status?: string
          phone_last3?: string | null
          photos?: string[]
          pieces?: Json | null
          product_title?: string
          shipment_ref?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          status?: string
          stripe_payment_link?: string | null
          total_paid_cents?: number | null
          tracking_number?: string | null
          tracking_token?: string
          tracking_url?: string | null
          updated_at?: string
          uploaded_not_purchased?: Json
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      price_estimates: {
        Row: {
          created_at: string | null
          est_hours: number | null
          estimated_grams: number | null
          estimated_price_high: number | null
          estimated_price_low: number | null
          file_name: string | null
          file_names: string[] | null
          file_paths: string[] | null
          grams: number | null
          id: string
          infill: string | null
          infill_pct: number | null
          language: string | null
          material: string | null
          multicolour: boolean | null
          price_high: number | null
          price_low: number | null
          quantity: number | null
          volume: number | null
          volume_cm3: number | null
        }
        Insert: {
          created_at?: string | null
          est_hours?: number | null
          estimated_grams?: number | null
          estimated_price_high?: number | null
          estimated_price_low?: number | null
          file_name?: string | null
          file_names?: string[] | null
          file_paths?: string[] | null
          grams?: number | null
          id?: string
          infill?: string | null
          infill_pct?: number | null
          language?: string | null
          material?: string | null
          multicolour?: boolean | null
          price_high?: number | null
          price_low?: number | null
          quantity?: number | null
          volume?: number | null
          volume_cm3?: number | null
        }
        Update: {
          created_at?: string | null
          est_hours?: number | null
          estimated_grams?: number | null
          estimated_price_high?: number | null
          estimated_price_low?: number | null
          file_name?: string | null
          file_names?: string[] | null
          file_paths?: string[] | null
          grams?: number | null
          id?: string
          infill?: string | null
          infill_pct?: number | null
          language?: string | null
          material?: string | null
          multicolour?: boolean | null
          price_high?: number | null
          price_low?: number | null
          quantity?: number | null
          volume?: number | null
          volume_cm3?: number | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean
          bound_email: string | null
          code: string
          created_at: string
          ends_at: string
          kind: string
          max_uses: number | null
          note: string | null
          pct: number
          starts_at: string
          uses: number
        }
        Insert: {
          active?: boolean
          bound_email?: string | null
          code: string
          created_at?: string
          ends_at: string
          kind: string
          max_uses?: number | null
          note?: string | null
          pct: number
          starts_at?: string
          uses?: number
        }
        Update: {
          active?: boolean
          bound_email?: string | null
          code?: string
          created_at?: string
          ends_at?: string
          kind?: string
          max_uses?: number | null
          note?: string | null
          pct?: number
          starts_at?: string
          uses?: number
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          browser_language: string | null
          color: string | null
          contact_email: string | null
          contact_phone: string | null
          converted_order_id: string | null
          created_at: string
          customization: Json | null
          estimated_grams: number
          estimated_hours: number
          estimated_price_high: number
          estimated_price_low: number
          file_names: string[] | null
          file_paths: string[]
          fulfillment: string | null
          id: string
          infill: string
          material: string
          multicolour: boolean | null
          page_language: string | null
          pieces: Json | null
          product_name: string | null
          product_slug: string | null
          quantity: number
          quote_expires_at: string | null
          quote_fulfillment: string | null
          quote_message: string | null
          quote_paid_at: string | null
          quote_price_cents: number | null
          quote_production_days: number | null
          quote_reminder_sent_at: string | null
          quote_sent_at: string | null
          quote_shipping_cents: number
          quote_stripe_link: string | null
          quote_token: string
          referrer_domain: string | null
          source_path: string | null
          status: string
          urgency: string | null
          utm_content: string | null
          utm_json: string | null
          utm_medium: string | null
          utm_source: string | null
          wall_loops: number
        }
        Insert: {
          browser_language?: string | null
          color?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          converted_order_id?: string | null
          created_at?: string
          customization?: Json | null
          estimated_grams: number
          estimated_hours: number
          estimated_price_high: number
          estimated_price_low: number
          file_names?: string[] | null
          file_paths?: string[]
          fulfillment?: string | null
          id?: string
          infill: string
          material: string
          multicolour?: boolean | null
          page_language?: string | null
          pieces?: Json | null
          product_name?: string | null
          product_slug?: string | null
          quantity: number
          quote_expires_at?: string | null
          quote_fulfillment?: string | null
          quote_message?: string | null
          quote_paid_at?: string | null
          quote_price_cents?: number | null
          quote_production_days?: number | null
          quote_reminder_sent_at?: string | null
          quote_sent_at?: string | null
          quote_shipping_cents?: number
          quote_stripe_link?: string | null
          quote_token?: string
          referrer_domain?: string | null
          source_path?: string | null
          status?: string
          urgency?: string | null
          utm_content?: string | null
          utm_json?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          wall_loops: number
        }
        Update: {
          browser_language?: string | null
          color?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          converted_order_id?: string | null
          created_at?: string
          customization?: Json | null
          estimated_grams?: number
          estimated_hours?: number
          estimated_price_high?: number
          estimated_price_low?: number
          file_names?: string[] | null
          file_paths?: string[]
          fulfillment?: string | null
          id?: string
          infill?: string
          material?: string
          multicolour?: boolean | null
          page_language?: string | null
          pieces?: Json | null
          product_name?: string | null
          product_slug?: string | null
          quantity?: number
          quote_expires_at?: string | null
          quote_fulfillment?: string | null
          quote_message?: string | null
          quote_paid_at?: string | null
          quote_price_cents?: number | null
          quote_production_days?: number | null
          quote_reminder_sent_at?: string | null
          quote_sent_at?: string | null
          quote_shipping_cents?: number
          quote_stripe_link?: string | null
          quote_token?: string
          referrer_domain?: string | null
          source_path?: string | null
          status?: string
          urgency?: string | null
          utm_content?: string | null
          utm_json?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          wall_loops?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_converted_order_id_fkey"
            columns: ["converted_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          approval_token: string
          created_at: string
          email: string
          id: string
          name: string
          order_reference: string | null
          published_at: string | null
          rating: number
          review_text: string
          status: string
        }
        Insert: {
          approval_token?: string
          created_at?: string
          email: string
          id?: string
          name: string
          order_reference?: string | null
          published_at?: string | null
          rating: number
          review_text: string
          status?: string
        }
        Update: {
          approval_token?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          order_reference?: string | null
          published_at?: string | null
          rating?: number
          review_text?: string
          status?: string
        }
        Relationships: []
      }
      saved_quotes: {
        Row: {
          created_at: string
          email: string
          id: string
          language: string | null
          purchased: boolean
          quote_payload: Json | null
          reminded_at: string | null
          source_page: string | null
          token: string
          total: number | null
          unsubscribed: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          language?: string | null
          purchased?: boolean
          quote_payload?: Json | null
          reminded_at?: string | null
          source_page?: string | null
          token?: string
          total?: number | null
          unsubscribed?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          language?: string | null
          purchased?: boolean
          quote_payload?: Json | null
          reminded_at?: string | null
          source_page?: string | null
          token?: string
          total?: number | null
          unsubscribed?: boolean
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
    }
    Views: {
      reviews_public: {
        Row: {
          id: string | null
          name: string | null
          published_at: string | null
          rating: number | null
          review_text: string | null
          status: string | null
        }
        Insert: {
          id?: string | null
          name?: string | null
          published_at?: string | null
          rating?: number | null
          review_text?: string | null
          status?: string | null
        }
        Update: {
          id?: string | null
          name?: string | null
          published_at?: string | null
          rating?: number | null
          review_text?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      gen_order_tracking_token: { Args: never; Returns: string }
      get_order_by_token: {
        Args: { _token: string }
        Returns: {
          carrier: string
          city: string
          country: string
          created_at: string
          customer_events: Json
          customer_notes: string
          delivered_at: string
          eta: string
          first_name: string
          fulfillment: string
          order_number: number
          photos: string[]
          pieces_summary: Json
          shipped_at: string
          status: string
          tracking_number: string
          tracking_url: string
          updated_at: string
        }[]
      }
      get_order_tracking: {
        Args: { _order_number: number; _phone_last3: string }
        Returns: {
          created_at: string
          eta: string
          fulfillment: string
          id: string
          notes: string
          order_number: number
          photos: string[]
          product_title: string
          status: string
          updated_at: string
        }[]
      }
      get_order_tracking_by_email: {
        Args: { _email: string; _order_number: number }
        Returns: {
          created_at: string
          eta: string
          fulfillment: string
          id: string
          notes: string
          order_number: number
          photos: string[]
          product_title: string
          status: string
          updated_at: string
        }[]
      }
      get_quote_by_token: {
        Args: { _token: string }
        Returns: {
          color: string
          created_at: string
          first_name: string
          id: string
          infill: string
          material: string
          page_language: string
          pieces: Json
          quote_expires_at: string
          quote_fulfillment: string
          quote_message: string
          quote_paid_at: string
          quote_price_cents: number
          quote_production_days: number
          quote_sent_at: string
          quote_shipping_cents: number
          quote_stripe_link: string
          wall_loops: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_promo_uses: { Args: { p_code: string }; Returns: undefined }
      unsubscribe_saved_quote: {
        Args: { p_token: string }
        Returns: boolean
      }
      validate_promo: {
        Args: { p_code: string; p_email?: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
    },
  },
} as const
