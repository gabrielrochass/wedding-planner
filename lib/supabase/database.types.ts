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
      budget_categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          planned_cents: number | null
          sort_order: number
          wedding_id: string
        }
        Insert: {
          created_at?: string
          icon: string
          id?: string
          name: string
          planned_cents?: number | null
          sort_order?: number
          wedding_id: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          planned_cents?: number | null
          sort_order?: number
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          category_id: string
          contracted_cents: number | null
          created_at: string
          estimated_cents: number | null
          id: string
          notes: string | null
          title: string
          updated_at: string
          updated_by: string | null
          vendor_id: string | null
          wedding_id: string
        }
        Insert: {
          category_id: string
          contracted_cents?: number | null
          created_at?: string
          estimated_cents?: number | null
          id?: string
          notes?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
          vendor_id?: string | null
          wedding_id: string
        }
        Update: {
          category_id?: string
          contracted_cents?: number | null
          created_at?: string
          estimated_cents?: number | null
          id?: string
          notes?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          vendor_id?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_wedding_id_fkey"
            columns: ["category_id", "wedding_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id", "wedding_id"]
          },
          {
            foreignKeyName: "expenses_vendor_id_wedding_id_fkey"
            columns: ["vendor_id", "wedding_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id", "wedding_id"]
          },
          {
            foreignKeyName: "expenses_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          age_band: Database["public"]["Enums"]["age_band"]
          created_at: string
          dietary: string | null
          household_id: string
          id: string
          is_plus_one: boolean
          name: string
          rsvp: Database["public"]["Enums"]["rsvp_status"]
          sort_order: number
          updated_at: string
          updated_by: string | null
          wedding_id: string
        }
        Insert: {
          age_band?: Database["public"]["Enums"]["age_band"]
          created_at?: string
          dietary?: string | null
          household_id: string
          id?: string
          is_plus_one?: boolean
          name: string
          rsvp?: Database["public"]["Enums"]["rsvp_status"]
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
          wedding_id: string
        }
        Update: {
          age_band?: Database["public"]["Enums"]["age_band"]
          created_at?: string
          dietary?: string | null
          household_id?: string
          id?: string
          is_plus_one?: boolean
          name?: string
          rsvp?: Database["public"]["Enums"]["rsvp_status"]
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_household_id_wedding_id_fkey"
            columns: ["household_id", "wedding_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id", "wedding_id"]
          },
          {
            foreignKeyName: "guests_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      home_items: {
        Row: {
          created_at: string
          estimate_cents: number | null
          household_id: string | null
          id: string
          name: string
          notes: string | null
          paid_cents: number | null
          priority: Database["public"]["Enums"]["home_priority"]
          quantity: number
          room: string
          status: Database["public"]["Enums"]["home_status"]
          store: string | null
          updated_at: string
          updated_by: string | null
          url: string | null
          wedding_id: string
        }
        Insert: {
          created_at?: string
          estimate_cents?: number | null
          household_id?: string | null
          id?: string
          name: string
          notes?: string | null
          paid_cents?: number | null
          priority?: Database["public"]["Enums"]["home_priority"]
          quantity?: number
          room?: string
          status?: Database["public"]["Enums"]["home_status"]
          store?: string | null
          updated_at?: string
          updated_by?: string | null
          url?: string | null
          wedding_id: string
        }
        Update: {
          created_at?: string
          estimate_cents?: number | null
          household_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          paid_cents?: number | null
          priority?: Database["public"]["Enums"]["home_priority"]
          quantity?: number
          room?: string
          status?: Database["public"]["Enums"]["home_status"]
          store?: string | null
          updated_at?: string
          updated_by?: string | null
          url?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "home_items_household_id_wedding_id_fkey"
            columns: ["household_id", "wedding_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id", "wedding_id"]
          },
          {
            foreignKeyName: "home_items_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          address: string | null
          created_at: string
          gift: string | null
          id: string
          invited_on: string | null
          list: Database["public"]["Enums"]["guest_list"]
          name: string
          notes: string | null
          phone: string | null
          save_the_date_on: string | null
          side: Database["public"]["Enums"]["guest_side"]
          thanked_on: string | null
          updated_at: string
          updated_by: string | null
          wedding_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          gift?: string | null
          id?: string
          invited_on?: string | null
          list?: Database["public"]["Enums"]["guest_list"]
          name: string
          notes?: string | null
          phone?: string | null
          save_the_date_on?: string | null
          side?: Database["public"]["Enums"]["guest_side"]
          thanked_on?: string | null
          updated_at?: string
          updated_by?: string | null
          wedding_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          gift?: string | null
          id?: string
          invited_on?: string | null
          list?: Database["public"]["Enums"]["guest_list"]
          name?: string
          notes?: string | null
          phone?: string | null
          save_the_date_on?: string | null
          side?: Database["public"]["Enums"]["guest_side"]
          thanked_on?: string | null
          updated_at?: string
          updated_by?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "households_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          board: string
          created_at: string
          estimate_cents: number | null
          id: string
          image_path: string | null
          notes: string | null
          status: Database["public"]["Enums"]["idea_status"]
          title: string
          updated_at: string
          updated_by: string | null
          url: string | null
          vendor_id: string | null
          wedding_id: string
        }
        Insert: {
          board?: string
          created_at?: string
          estimate_cents?: number | null
          id?: string
          image_path?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["idea_status"]
          title: string
          updated_at?: string
          updated_by?: string | null
          url?: string | null
          vendor_id?: string | null
          wedding_id: string
        }
        Update: {
          board?: string
          created_at?: string
          estimate_cents?: number | null
          id?: string
          image_path?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["idea_status"]
          title?: string
          updated_at?: string
          updated_by?: string | null
          url?: string | null
          vendor_id?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_vendor_id_wedding_id_fkey"
            columns: ["vendor_id", "wedding_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id", "wedding_id"]
          },
          {
            foreignKeyName: "ideas_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      party_members: {
        Row: {
          attire: string | null
          created_at: string
          entrance_order: number
          id: string
          invite_status: Database["public"]["Enums"]["party_invite"]
          name: string
          notes: string | null
          pair_id: string | null
          phone: string | null
          role: string
          side: Database["public"]["Enums"]["guest_side"]
          updated_at: string
          updated_by: string | null
          wedding_id: string
        }
        Insert: {
          attire?: string | null
          created_at?: string
          entrance_order?: number
          id?: string
          invite_status?: Database["public"]["Enums"]["party_invite"]
          name: string
          notes?: string | null
          pair_id?: string | null
          phone?: string | null
          role: string
          side?: Database["public"]["Enums"]["guest_side"]
          updated_at?: string
          updated_by?: string | null
          wedding_id: string
        }
        Update: {
          attire?: string | null
          created_at?: string
          entrance_order?: number
          id?: string
          invite_status?: Database["public"]["Enums"]["party_invite"]
          name?: string
          notes?: string | null
          pair_id?: string | null
          phone?: string | null
          role?: string
          side?: Database["public"]["Enums"]["guest_side"]
          updated_at?: string
          updated_by?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_members_pair_id_wedding_id_fkey"
            columns: ["pair_id", "wedding_id"]
            isOneToOne: false
            referencedRelation: "party_members"
            referencedColumns: ["id", "wedding_id"]
          },
          {
            foreignKeyName: "party_members_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          due_on: string
          expense_id: string
          id: string
          installment_count: number | null
          installment_number: number | null
          method: Database["public"]["Enums"]["payment_method"] | null
          note: string | null
          paid_on: string | null
          updated_at: string
          updated_by: string | null
          wedding_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          due_on: string
          expense_id: string
          id?: string
          installment_count?: number | null
          installment_number?: number | null
          method?: Database["public"]["Enums"]["payment_method"] | null
          note?: string | null
          paid_on?: string | null
          updated_at?: string
          updated_by?: string | null
          wedding_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          due_on?: string
          expense_id?: string
          id?: string
          installment_count?: number | null
          installment_number?: number | null
          method?: Database["public"]["Enums"]["payment_method"] | null
          note?: string | null
          paid_on?: string | null
          updated_at?: string
          updated_by?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_expense_id_wedding_id_fkey"
            columns: ["expense_id", "wedding_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id", "wedding_id"]
          },
          {
            foreignKeyName: "payments_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          current_wedding_id: string | null
          display_name: string | null
          heard_from: string | null
          id: string
          planning_as: string | null
          tours_seen: string[]
        }
        Insert: {
          created_at?: string
          current_wedding_id?: string | null
          display_name?: string | null
          heard_from?: string | null
          id: string
          planning_as?: string | null
          tours_seen?: string[]
        }
        Update: {
          created_at?: string
          current_wedding_id?: string | null
          display_name?: string | null
          heard_from?: string | null
          id?: string
          planning_as?: string | null
          tours_seen?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_wedding_id_fkey"
            columns: ["current_wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          artist: string | null
          chosen: boolean
          created_at: string
          id: string
          moment: string
          title: string
          updated_at: string
          updated_by: string | null
          url: string | null
          wedding_id: string
        }
        Insert: {
          artist?: string | null
          chosen?: boolean
          created_at?: string
          id?: string
          moment: string
          title: string
          updated_at?: string
          updated_by?: string | null
          url?: string | null
          wedding_id: string
        }
        Update: {
          artist?: string | null
          chosen?: boolean
          created_at?: string
          id?: string
          moment?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          url?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "songs_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          area: string
          assignee_id: string | null
          assignee_label: string | null
          created_at: string
          done_at: string | null
          due_on: string | null
          id: string
          notes: string | null
          offset_days: number | null
          template_key: string | null
          title: string
          updated_at: string
          updated_by: string | null
          vendor_id: string | null
          wedding_id: string
        }
        Insert: {
          area?: string
          assignee_id?: string | null
          assignee_label?: string | null
          created_at?: string
          done_at?: string | null
          due_on?: string | null
          id?: string
          notes?: string | null
          offset_days?: number | null
          template_key?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
          vendor_id?: string | null
          wedding_id: string
        }
        Update: {
          area?: string
          assignee_id?: string | null
          assignee_label?: string | null
          created_at?: string
          done_at?: string | null
          due_on?: string | null
          id?: string
          notes?: string | null
          offset_days?: number | null
          template_key?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          vendor_id?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_vendor_id_wedding_id_fkey"
            columns: ["vendor_id", "wedding_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id", "wedding_id"]
          },
          {
            foreignKeyName: "tasks_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_items: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          notes: string | null
          place: string | null
          responsible: string | null
          song_id: string | null
          starts_at: string
          title: string
          updated_at: string
          updated_by: string | null
          wedding_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          notes?: string | null
          place?: string | null
          responsible?: string | null
          song_id?: string | null
          starts_at: string
          title: string
          updated_at?: string
          updated_by?: string | null
          wedding_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          notes?: string | null
          place?: string | null
          responsible?: string | null
          song_id?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_items_song_id_wedding_id_fkey"
            columns: ["song_id", "wedding_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id", "wedding_id"]
          },
          {
            foreignKeyName: "timeline_items_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          capacity: number | null
          category_id: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          instagram: string | null
          name: string
          notes: string | null
          phone: string | null
          quote_cents: number | null
          quote_details: string | null
          rating: number | null
          status: Database["public"]["Enums"]["vendor_status"]
          updated_at: string
          updated_by: string | null
          visit_on: string | null
          website: string | null
          wedding_id: string
        }
        Insert: {
          capacity?: number | null
          category_id?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          instagram?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          quote_cents?: number | null
          quote_details?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["vendor_status"]
          updated_at?: string
          updated_by?: string | null
          visit_on?: string | null
          website?: string | null
          wedding_id: string
        }
        Update: {
          capacity?: number | null
          category_id?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          instagram?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          quote_cents?: number | null
          quote_details?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["vendor_status"]
          updated_at?: string
          updated_by?: string | null
          visit_on?: string | null
          website?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_category_id_wedding_id_fkey"
            columns: ["category_id", "wedding_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id", "wedding_id"]
          },
          {
            foreignKeyName: "vendors_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["member_role"]
          token_hash: string
          wedding_id: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          role: Database["public"]["Enums"]["member_role"]
          token_hash: string
          wedding_id: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["member_role"]
          token_hash?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_invites_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_members: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_members_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      weddings: {
        Row: {
          budget_cents: number | null
          ceremony: Database["public"]["Enums"]["ceremony_kind"]
          city: string | null
          contingency_percent: number
          created_at: string
          created_by: string | null
          date_is_estimate: boolean
          guest_estimate: number | null
          id: string
          motto: string | null
          partner_a: string
          partner_b: string
          priorities: string[]
          wedding_date: string | null
        }
        Insert: {
          budget_cents?: number | null
          ceremony?: Database["public"]["Enums"]["ceremony_kind"]
          city?: string | null
          contingency_percent?: number
          created_at?: string
          created_by?: string | null
          date_is_estimate?: boolean
          guest_estimate?: number | null
          id?: string
          motto?: string | null
          partner_a: string
          partner_b: string
          priorities?: string[]
          wedding_date?: string | null
        }
        Update: {
          budget_cents?: number | null
          ceremony?: Database["public"]["Enums"]["ceremony_kind"]
          city?: string | null
          contingency_percent?: number
          created_at?: string
          created_by?: string | null
          date_is_estimate?: boolean
          guest_estimate?: number | null
          id?: string
          motto?: string | null
          partner_a?: string
          partner_b?: string
          priorities?: string[]
          wedding_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invite: { Args: { p_token: string }; Returns: string }
      create_invite: {
        Args: {
          p_role: Database["public"]["Enums"]["member_role"]
          p_wedding: string
        }
        Returns: string
      }
      create_wedding: {
        Args: {
          p_budget_cents?: number
          p_categories: Json
          p_ceremony: Database["public"]["Enums"]["ceremony_kind"]
          p_city?: string
          p_date?: string
          p_date_is_estimate?: boolean
          p_guest_estimate?: number
          p_id: string
          p_partner_a: string
          p_partner_b: string
          p_planning_as?: string
          p_priorities?: string[]
          p_tasks: Json
        }
        Returns: string
      }
      hire_vendor: {
        Args: {
          p_category_id: string
          p_contracted_cents: number
          p_expense_id: string
          p_payments: Json
          p_title: string
          p_vendor_id: string
        }
        Returns: undefined
      }
      invite_preview: {
        Args: { p_token: string }
        Returns: {
          already_member: boolean
          partner_a: string
          partner_b: string
          role: Database["public"]["Enums"]["member_role"]
        }[]
      }
      wedding_people: {
        Args: { p_wedding: string }
        Returns: {
          display_name: string
          joined_at: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }[]
      }
    }
    Enums: {
      age_band: "adult" | "teen" | "child" | "baby"
      ceremony_kind: "civil" | "religious" | "both"
      guest_list: "pending" | "a" | "b" | "out"
      guest_side: "a" | "b" | "both"
      home_priority: "essential" | "important" | "nice"
      home_status: "missing" | "wishlist" | "bought" | "gifted"
      idea_status: "idea" | "approved" | "discarded"
      member_role: "couple" | "planner" | "helper" | "viewer"
      party_invite: "pending" | "ordered" | "delivered"
      payment_method: "pix" | "boleto" | "card" | "cash" | "transfer"
      rsvp_status: "pending" | "yes" | "no"
      vendor_status:
        | "researching"
        | "quoted"
        | "visiting"
        | "favorite"
        | "hired"
        | "discarded"
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
      age_band: ["adult", "teen", "child", "baby"],
      ceremony_kind: ["civil", "religious", "both"],
      guest_list: ["pending", "a", "b", "out"],
      guest_side: ["a", "b", "both"],
      home_priority: ["essential", "important", "nice"],
      home_status: ["missing", "wishlist", "bought", "gifted"],
      idea_status: ["idea", "approved", "discarded"],
      member_role: ["couple", "planner", "helper", "viewer"],
      party_invite: ["pending", "ordered", "delivered"],
      payment_method: ["pix", "boleto", "card", "cash", "transfer"],
      rsvp_status: ["pending", "yes", "no"],
      vendor_status: [
        "researching",
        "quoted",
        "visiting",
        "favorite",
        "hired",
        "discarded",
      ],
    },
  },
} as const

