export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          created_at: string
          delivered_count: number
          failed_count: number
          id: string
          media_url: string | null
          name: string
          recipients_count: number
          sent_at: string | null
          status: string
          template_id: string | null
          template_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivered_count?: number
          failed_count?: number
          id?: string
          media_url?: string | null
          name: string
          recipients_count?: number
          sent_at?: string | null
          status?: string
          template_id?: string | null
          template_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          delivered_count?: number
          failed_count?: number
          id?: string
          media_url?: string | null
          name?: string
          recipients_count?: number
          sent_at?: string | null
          status?: string
          template_id?: string | null
          template_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chatbot_flows: {
        Row: {
          created_at: string
          edges: Json
          id: string
          name: string
          nodes: Json
          status: string
          trigger: Json
          updated_at: string
          user_id: string
          variables: Json
        }
        Insert: {
          created_at?: string
          edges?: Json
          id?: string
          name: string
          nodes?: Json
          status?: string
          trigger: Json
          updated_at?: string
          user_id: string
          variables?: Json
        }
        Update: {
          created_at?: string
          edges?: Json
          id?: string
          name?: string
          nodes?: Json
          status?: string
          trigger?: Json
          updated_at?: string
          user_id?: string
          variables?: Json
        }
        Relationships: []
      }
      contacts: {
        Row: {
          country: string | null
          created_at: string
          email: string | null
          id: string
          last_message_at: string | null
          name: string | null
          phone_number: string
          profile_picture_url: string | null
          source: string | null
          tags: string[] | null
          total_messages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_message_at?: string | null
          name?: string | null
          phone_number: string
          profile_picture_url?: string | null
          source?: string | null
          tags?: string[] | null
          total_messages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_message_at?: string | null
          name?: string | null
          phone_number?: string
          profile_picture_url?: string | null
          source?: string | null
          tags?: string[] | null
          total_messages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          last_message_id: string | null
          status: string
          unread_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          last_message_id?: string | null
          status?: string
          unread_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          last_message_id?: string | null
          status?: string
          unread_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_last_message_id_fkey"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_executions: {
        Row: {
          conversation_id: string
          created_at: string
          current_node_id: string
          flow_id: string
          id: string
          status: string
          updated_at: string
          variables: Json
        }
        Insert: {
          conversation_id: string
          created_at?: string
          current_node_id: string
          flow_id: string
          id?: string
          status?: string
          updated_at?: string
          variables?: Json
        }
        Update: {
          conversation_id?: string
          created_at?: string
          current_node_id?: string
          flow_id?: string
          id?: string
          status?: string
          updated_at?: string
          variables?: Json
        }
        Relationships: [
          {
            foreignKeyName: "flow_executions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_executions_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "chatbot_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: Json
          conversation_id: string
          created_at: string
          id: string
          message_type: string
          sender_type: string
          status: string
          timestamp: string
          whatsapp_message_id: string | null
        }
        Insert: {
          content: Json
          conversation_id: string
          created_at?: string
          id?: string
          message_type: string
          sender_type: string
          status?: string
          timestamp?: string
          whatsapp_message_id?: string | null
        }
        Update: {
          content?: Json
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
          sender_type?: string
          status?: string
          timestamp?: string
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          workspace: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          workspace?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          workspace?: string
        }
        Relationships: []
      }
      whatsapp_settings: {
        Row: {
          access_token: string
          api_version: string
          app_id: string
          created_at: string
          graph_api_base_url: string
          hub_verify_token: string
          id: string
          phone_number_id: string
          updated_at: string
          user_id: string
          waba_id: string
        }
        Insert: {
          access_token: string
          api_version?: string
          app_id: string
          created_at?: string
          graph_api_base_url?: string
          hub_verify_token: string
          id?: string
          phone_number_id: string
          updated_at?: string
          user_id: string
          waba_id: string
        }
        Update: {
          access_token?: string
          api_version?: string
          app_id?: string
          created_at?: string
          graph_api_base_url?: string
          hub_verify_token?: string
          id?: string
          phone_number_id?: string
          updated_at?: string
          user_id?: string
          waba_id?: string
        }
        Relationships: []
      }
      whatsapp_templates: {
        Row: {
          body_text: string
          buttons: Json | null
          category: string
          created_at: string
          footer_text: string | null
          header_content: string | null
          header_type: string | null
          id: string
          language: string
          name: string
          status: string
          updated_at: string
          user_id: string
          variables: Json | null
          whatsapp_template_id: string | null
        }
        Insert: {
          body_text: string
          buttons?: Json | null
          category: string
          created_at?: string
          footer_text?: string | null
          header_content?: string | null
          header_type?: string | null
          id?: string
          language?: string
          name: string
          status?: string
          updated_at?: string
          user_id: string
          variables?: Json | null
          whatsapp_template_id?: string | null
        }
        Update: {
          body_text?: string
          buttons?: Json | null
          category?: string
          created_at?: string
          footer_text?: string | null
          header_content?: string | null
          header_type?: string | null
          id?: string
          language?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
          variables?: Json | null
          whatsapp_template_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "manager" | "agent"
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
      user_role: ["admin", "manager", "agent"],
    },
  },
} as const
