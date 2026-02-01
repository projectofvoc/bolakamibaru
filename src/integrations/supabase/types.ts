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
      advertisements: {
        Row: {
          created_at: string | null
          display_duration: number | null
          id: string
          is_active: boolean | null
          link_url: string | null
          media_type: string
          media_url: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_duration?: number | null
          id?: string
          is_active?: boolean | null
          link_url?: string | null
          media_type?: string
          media_url: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_duration?: number | null
          id?: string
          is_active?: boolean | null
          link_url?: string | null
          media_type?: string
          media_url?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          event_type: string
          id: string
          os: string | null
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type?: string
          id?: string
          os?: string | null
          page_path: string
          page_title?: string | null
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type?: string
          id?: string
          os?: string | null
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_sessions: {
        Row: {
          browser: string | null
          country: string | null
          device_type: string | null
          duration_seconds: number | null
          ended_at: string | null
          entry_page: string | null
          exit_page: string | null
          id: string
          is_bounced: boolean | null
          last_activity_at: string | null
          os: string | null
          pageviews: number | null
          referrer: string | null
          referrer_source: string | null
          session_id: string
          started_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          entry_page?: string | null
          exit_page?: string | null
          id?: string
          is_bounced?: boolean | null
          last_activity_at?: string | null
          os?: string | null
          pageviews?: number | null
          referrer?: string | null
          referrer_source?: string | null
          session_id: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          entry_page?: string | null
          exit_page?: string | null
          id?: string
          is_bounced?: boolean | null
          last_activity_at?: string | null
          os?: string | null
          pageviews?: number | null
          referrer?: string | null
          referrer_source?: string | null
          session_id?: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_cache: {
        Row: {
          cache_key: string
          cache_value: Json
          created_at: string | null
          expires_at: string
          id: string
        }
        Insert: {
          cache_key: string
          cache_value: Json
          created_at?: string | null
          expires_at: string
          id?: string
        }
        Update: {
          cache_key?: string
          cache_value?: Json
          created_at?: string | null
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      api_configurations: {
        Row: {
          api_key: string | null
          category: string | null
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          api_key?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          api_key?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      api_configurations_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          config_id: string | null
          id: string
          new_api_key: string | null
          old_api_key: string | null
          reason: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          config_id?: string | null
          id?: string
          new_api_key?: string | null
          old_api_key?: string | null
          reason?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          config_id?: string | null
          id?: string
          new_api_key?: string | null
          old_api_key?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_configurations_history_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "api_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      article_views: {
        Row: {
          article_id: string
          id: string
          session_id: string
          viewed_at: string | null
        }
        Insert: {
          article_id: string
          id?: string
          session_id: string
          viewed_at?: string | null
        }
        Update: {
          article_id?: string
          id?: string
          session_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          author_name: string | null
          badge_expires_at: string | null
          badges: string[] | null
          category: string
          club: string | null
          content_en: string
          content_id: string
          created_at: string | null
          excerpt_en: string | null
          excerpt_id: string | null
          featured_image: string | null
          id: string
          is_featured: boolean | null
          league: string | null
          published_at: string | null
          publisher_icon: string | null
          publisher_name: string | null
          publisher_verified: boolean | null
          slug: string
          sort_order: number | null
          status: string | null
          tags: string[] | null
          title_en: string
          title_id: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          badge_expires_at?: string | null
          badges?: string[] | null
          category?: string
          club?: string | null
          content_en: string
          content_id: string
          created_at?: string | null
          excerpt_en?: string | null
          excerpt_id?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          league?: string | null
          published_at?: string | null
          publisher_icon?: string | null
          publisher_name?: string | null
          publisher_verified?: boolean | null
          slug: string
          sort_order?: number | null
          status?: string | null
          tags?: string[] | null
          title_en: string
          title_id: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          badge_expires_at?: string | null
          badges?: string[] | null
          category?: string
          club?: string | null
          content_en?: string
          content_id?: string
          created_at?: string | null
          excerpt_en?: string | null
          excerpt_id?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          league?: string | null
          published_at?: string | null
          publisher_icon?: string | null
          publisher_name?: string | null
          publisher_verified?: boolean | null
          slug?: string
          sort_order?: number | null
          status?: string | null
          tags?: string[] | null
          title_en?: string
          title_id?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      best_moments: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          sort_order: number | null
          thumbnail_url: string
          title_en: string
          title_id: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          thumbnail_url: string
          title_en: string
          title_id: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          thumbnail_url?: string
          title_en?: string
          title_id?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      clubs: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          league_id: string | null
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          league_id?: string | null
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          league_id?: string | null
          logo_url?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "clubs_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      footer_banners: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          position: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          position?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          position?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leagues: {
        Row: {
          country: string | null
          created_at: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          is_international: boolean | null
          name: string
          name_en: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          is_international?: boolean | null
          name: string
          name_en?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          is_international?: boolean | null
          name?: string
          name_en?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      nav_items: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_external: boolean | null
          label_en: string
          label_id: string
          parent_id: string | null
          path: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_external?: boolean | null
          label_en: string
          label_id: string
          parent_id?: string | null
          path: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_external?: boolean | null
          label_en?: string
          label_id?: string
          parent_id?: string | null
          path?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nav_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "nav_items"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_links: {
        Row: {
          created_at: string | null
          display_name: string
          icon_name: string
          id: string
          is_active: boolean | null
          platform: string
          sort_order: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          icon_name: string
          id?: string
          is_active?: boolean | null
          platform: string
          sort_order?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          icon_name?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          sort_order?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_cache: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_article_views: {
        Args: { article_id: string }
        Returns: undefined
      }
      increment_article_views_with_session: {
        Args: { p_article_id: string; p_session_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "author" | "user"
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
      app_role: ["admin", "author", "user"],
    },
  },
} as const
