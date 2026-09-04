export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      availability_exceptions: {
        Row: {
          closes_at: string | null
          created_at: string
          date: string
          id: string
          is_closed: boolean
          note: string | null
          opens_at: string | null
          org_id: string
          resource_id: string | null
        }
        Insert: {
          closes_at?: string | null
          created_at?: string
          date: string
          id?: string
          is_closed?: boolean
          note?: string | null
          opens_at?: string | null
          org_id: string
          resource_id?: string | null
        }
        Update: {
          closes_at?: string | null
          created_at?: string
          date?: string
          id?: string
          is_closed?: boolean
          note?: string | null
          opens_at?: string | null
          org_id?: string
          resource_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_exceptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_exceptions_org_id_resource_id_fkey"
            columns: ["org_id", "resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["org_id", "id"]
          },
        ]
      }
      availability_rules: {
        Row: {
          closes_at: string
          created_at: string
          id: string
          opens_at: string
          org_id: string
          resource_id: string | null
          weekday: number
        }
        Insert: {
          closes_at: string
          created_at?: string
          id?: string
          opens_at: string
          org_id: string
          resource_id?: string | null
          weekday: number
        }
        Update: {
          closes_at?: string
          created_at?: string
          id?: string
          opens_at?: string
          org_id?: string
          resource_id?: string | null
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "availability_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_rules_org_id_resource_id_fkey"
            columns: ["org_id", "resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["org_id", "id"]
          },
        ]
      }
      booking_events: {
        Row: {
          actor_id: string | null
          at: string
          booking_id: string
          from_status: Database["public"]["Enums"]["booking_status"] | null
          id: string
          meta: Json
          org_id: string
          to_status: Database["public"]["Enums"]["booking_status"]
        }
        Insert: {
          actor_id?: string | null
          at?: string
          booking_id: string
          from_status?: Database["public"]["Enums"]["booking_status"] | null
          id?: string
          meta?: Json
          org_id: string
          to_status: Database["public"]["Enums"]["booking_status"]
        }
        Update: {
          actor_id?: string | null
          at?: string
          booking_id?: string
          from_status?: Database["public"]["Enums"]["booking_status"] | null
          id?: string
          meta?: Json
          org_id?: string
          to_status?: Database["public"]["Enums"]["booking_status"]
        }
        Relationships: [
          {
            foreignKeyName: "booking_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          blocked_range: unknown
          buffer_after_minutes: number
          buffer_before_minutes: number
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          ends_at: string
          google_event_id: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          org_id: string
          party_size: number
          resource_id: string
          service_id: string | null
          source: Database["public"]["Enums"]["booking_source"]
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string | null
        }
        Insert: {
          blocked_range: unknown
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          ends_at: string
          google_event_id?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          org_id: string
          party_size?: number
          resource_id: string
          service_id?: string | null
          source?: Database["public"]["Enums"]["booking_source"]
          starts_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string | null
        }
        Update: {
          blocked_range?: unknown
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          ends_at?: string
          google_event_id?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          org_id?: string
          party_size?: number
          resource_id?: string
          service_id?: string | null
          source?: Database["public"]["Enums"]["booking_source"]
          starts_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_org_id_customer_id_fkey"
            columns: ["org_id", "customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["org_id", "id"]
          },
          {
            foreignKeyName: "bookings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_org_id_resource_id_fkey"
            columns: ["org_id", "resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["org_id", "id"]
          },
          {
            foreignKeyName: "bookings_org_id_service_id_fkey"
            columns: ["org_id", "service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["org_id", "id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          last_visit_at: string | null
          marketing_opt_in: boolean
          notes: string | null
          org_id: string
          phone: string | null
          visits_count: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          last_visit_at?: string | null
          marketing_opt_in?: boolean
          notes?: string | null
          org_id: string
          phone?: string | null
          visits_count?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          last_visit_at?: string | null
          marketing_opt_in?: boolean
          notes?: string | null
          org_id?: string
          phone?: string | null
          visits_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "customers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          org_id: string
          role: Database["public"]["Enums"]["member_role"]
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          org_id: string
          role: Database["public"]["Enums"]["member_role"]
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          address: string | null
          created_at: string
          currency: string
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json
          slug: string
          status: Database["public"]["Enums"]["org_status"]
          timezone: string
          updated_at: string | null
          vertical: Database["public"]["Enums"]["vertical_type"]
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          currency?: string
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json
          slug: string
          status?: Database["public"]["Enums"]["org_status"]
          timezone?: string
          updated_at?: string | null
          vertical: Database["public"]["Enums"]["vertical_type"]
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          currency?: string
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json
          slug?: string
          status?: Database["public"]["Enums"]["org_status"]
          timezone?: string
          updated_at?: string | null
          vertical?: Database["public"]["Enums"]["vertical_type"]
          whatsapp?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_platform_admin: boolean
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_platform_admin?: boolean
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_platform_admin?: boolean
          phone?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          archived_at: string | null
          capacity: number
          created_at: string
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["resource_kind"]
          metadata: Json
          name: string
          org_id: string
          sort_order: number
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          capacity?: number
          created_at?: string
          id?: string
          is_active?: boolean
          kind: Database["public"]["Enums"]["resource_kind"]
          metadata?: Json
          name: string
          org_id: string
          sort_order?: number
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          capacity?: number
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["resource_kind"]
          metadata?: Json
          name?: string
          org_id?: string
          sort_order?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_resources: {
        Row: {
          created_at: string
          org_id: string
          resource_id: string
          service_id: string
        }
        Insert: {
          created_at?: string
          org_id: string
          resource_id: string
          service_id: string
        }
        Update: {
          created_at?: string
          org_id?: string
          resource_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_resources_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_resources_org_id_resource_id_fkey"
            columns: ["org_id", "resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["org_id", "id"]
          },
          {
            foreignKeyName: "service_resources_org_id_service_id_fkey"
            columns: ["org_id", "service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["org_id", "id"]
          },
        ]
      }
      services: {
        Row: {
          archived_at: string | null
          buffer_after_minutes: number
          buffer_before_minutes: number
          created_at: string
          currency: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          is_public: boolean
          name: string
          org_id: string
          price_cents: number | null
          sort_order: number
        }
        Insert: {
          archived_at?: string | null
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean
          is_public?: boolean
          name: string
          org_id: string
          price_cents?: number | null
          sort_order?: number
        }
        Update: {
          archived_at?: string | null
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_public?: boolean
          name?: string
          org_id?: string
          price_cents?: number | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "services_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          created_at: string
          domain: string
          id: string
          name: string
          org_id: string
          public_key: string
          status: string
          vercel_project_id: string | null
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          name?: string
          org_id: string
          public_key?: string
          status?: string
          vercel_project_id?: string | null
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          name?: string
          org_id?: string
          public_key?: string
          status?: string
          vercel_project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invite: {
        Args: { p_token: string }
        Returns: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "memberships"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_create_org: {
        Args: {
          p_name: string
          p_owner_email: string
          p_slug: string
          p_vertical: Database["public"]["Enums"]["vertical_type"]
        }
        Returns: Json
      }
      create_booking: {
        Args: {
          p_customer?: Json
          p_notes?: string
          p_org: string
          p_party_size?: number
          p_resource: string
          p_service: string
          p_starts_at: string
        }
        Returns: {
          blocked_range: unknown
          buffer_after_minutes: number
          buffer_before_minutes: number
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          ends_at: string
          google_event_id: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          org_id: string
          party_size: number
          resource_id: string
          service_id: string | null
          source: Database["public"]["Enums"]["booking_source"]
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_invite: {
        Args: {
          p_email: string
          p_org: string
          p_role: Database["public"]["Enums"]["member_role"]
        }
        Returns: Json
      }
      get_availability: {
        Args: {
          p_from: string
          p_org: string
          p_party_size?: number
          p_service: string
          p_to: string
        }
        Returns: {
          ends_at: string
          resource_id: string
          resource_name: string
          starts_at: string
        }[]
      }
      reschedule_booking: {
        Args: { p_booking: string; p_resource?: string; p_starts_at: string }
        Returns: {
          blocked_range: unknown
          buffer_after_minutes: number
          buffer_before_minutes: number
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          ends_at: string
          google_event_id: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          org_id: string
          party_size: number
          resource_id: string
          service_id: string | null
          source: Database["public"]["Enums"]["booking_source"]
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_booking_status: {
        Args: {
          p_booking: string
          p_reason?: string
          p_status: Database["public"]["Enums"]["booking_status"]
        }
        Returns: {
          blocked_range: unknown
          buffer_after_minutes: number
          buffer_before_minutes: number
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          ends_at: string
          google_event_id: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          org_id: string
          party_size: number
          resource_id: string
          service_id: string | null
          source: Database["public"]["Enums"]["booking_source"]
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      booking_source: "portal" | "public_site" | "walk_in" | "phone" | "google"
      booking_status:
        | "pending"
        | "confirmed"
        | "seated"
        | "completed"
        | "cancelled"
        | "no_show"
      lead_status: "new" | "contacted" | "won" | "lost"
      member_role: "owner" | "manager" | "staff"
      org_status: "trial" | "active" | "paused" | "archived"
      payment_status: "paid" | "pending" | "overdue" | "waived"
      resource_kind:
        | "table"
        | "chair"
        | "room"
        | "court"
        | "staff"
        | "equipment"
      vertical_type: "restaurant" | "cafe" | "gym" | "barbershop" | "generic"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      booking_source: ["portal", "public_site", "walk_in", "phone", "google"],
      booking_status: [
        "pending",
        "confirmed",
        "seated",
        "completed",
        "cancelled",
        "no_show",
      ],
      lead_status: ["new", "contacted", "won", "lost"],
      member_role: ["owner", "manager", "staff"],
      org_status: ["trial", "active", "paused", "archived"],
      payment_status: ["paid", "pending", "overdue", "waived"],
      resource_kind: ["table", "chair", "room", "court", "staff", "equipment"],
      vertical_type: ["restaurant", "cafe", "gym", "barbershop", "generic"],
    },
  },
} as const

