export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      active_programs: {
        Row: {
          created_at: string
          id: string
          program_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          program_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          program_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "active_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_programs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_invitations: {
        Row: {
          athlete_id: string | null
          coach_id: string
          created_at: string
          email: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          athlete_id?: string | null
          coach_id: string
          created_at?: string
          email: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          athlete_id?: string | null
          coach_id?: string
          created_at?: string
          email?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_invitations_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_invitations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_athletes: {
        Row: {
          athlete_id: string | null
          coach_id: string | null
          created_at: string
          id: string
        }
        Insert: {
          athlete_id?: string | null
          coach_id?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          athlete_id?: string | null
          coach_id?: string | null
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_athletes_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_athletes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          created_at: string
          date: string
          distance: Database["public"]["Enums"]["sprint_distance"]
          ffa_url: string | null
          id: string
          is_main: boolean | null
          level: Database["public"]["Enums"]["competition_level"]
          location: string | null
          name: string
          program_id: string | null
          time: string | null
        }
        Insert: {
          created_at?: string
          date: string
          distance: Database["public"]["Enums"]["sprint_distance"]
          ffa_url?: string | null
          id?: string
          is_main?: boolean | null
          level: Database["public"]["Enums"]["competition_level"]
          location?: string | null
          name: string
          program_id?: string | null
          time?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          distance?: Database["public"]["Enums"]["sprint_distance"]
          ffa_url?: string | null
          id?: string
          is_main?: boolean | null
          level?: Database["public"]["Enums"]["competition_level"]
          location?: string | null
          name?: string
          program_id?: string | null
          time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          max_athletes: number | null
          role: string | null
          subscription_expiry: string | null
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          max_athletes?: number | null
          role?: string | null
          subscription_expiry?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          max_athletes?: number | null
          role?: string | null
          subscription_expiry?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      program_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_folder_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_folder_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_folder_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "program_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      program_phase_descriptions: {
        Row: {
          created_at: string
          description: string
          id: string
          objectives: string[]
          phase: Database["public"]["Enums"]["training_phase_description"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          objectives: string[]
          phase: Database["public"]["Enums"]["training_phase_description"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          objectives?: string[]
          phase?: Database["public"]["Enums"]["training_phase_description"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string
          duration: number
          folder_id: string | null
          generated: boolean | null
          id: string
          intermediate_competitions: Json[] | null
          main_competition: Json | null
          main_distance: string | null
          name: string
          objectives: string | null
          phase: string | null
          phase_duration: number | null
          sessions_per_week: number | null
          start_date: string
          training_days: string[] | null
          training_phase: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration: number
          folder_id?: string | null
          generated?: boolean | null
          id?: string
          intermediate_competitions?: Json[] | null
          main_competition?: Json | null
          main_distance?: string | null
          name: string
          objectives?: string | null
          phase?: string | null
          phase_duration?: number | null
          sessions_per_week?: number | null
          start_date: string
          training_days?: string[] | null
          training_phase?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration?: number
          folder_id?: string | null
          generated?: boolean | null
          id?: string
          intermediate_competitions?: Json[] | null
          main_competition?: Json | null
          main_distance?: string | null
          name?: string
          objectives?: string | null
          phase?: string | null
          phase_duration?: number | null
          sessions_per_week?: number | null
          start_date?: string
          training_days?: string[] | null
          training_phase?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "program_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_programs: {
        Row: {
          athlete_id: string
          coach_id: string
          created_at: string
          id: string
          program_id: string
          status: string
        }
        Insert: {
          athlete_id: string
          coach_id: string
          created_at?: string
          id?: string
          program_id: string
          status?: string
        }
        Update: {
          athlete_id?: string
          coach_id?: string
          created_at?: string
          id?: string
          program_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_programs_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_programs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_feedback: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          perceived_difficulty: number | null
          rating: number | null
          updated_at: string
          user_id: string | null
          workout_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          perceived_difficulty?: number | null
          rating?: number | null
          updated_at?: string
          user_id?: string | null
          workout_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          perceived_difficulty?: number | null
          rating?: number | null
          updated_at?: string
          user_id?: string | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_feedback_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          created_at: string
          description: string | null
          details: Json | null
          distance: Database["public"]["Enums"]["sprint_distance"] | null
          id: string
          intensity: string | null
          phase: Database["public"]["Enums"]["training_phase"] | null
          recovery: string | null
          sequence_order: number
          sessions_per_week: number
          theme: string | null
          title: string
          training_phase: string | null
          type: Database["public"]["Enums"]["workout_type"] | null
          updated_at: string
          week_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          details?: Json | null
          distance?: Database["public"]["Enums"]["sprint_distance"] | null
          id?: string
          intensity?: string | null
          phase?: Database["public"]["Enums"]["training_phase"] | null
          recovery?: string | null
          sequence_order: number
          sessions_per_week: number
          theme?: string | null
          title: string
          training_phase?: string | null
          type?: Database["public"]["Enums"]["workout_type"] | null
          updated_at?: string
          week_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          details?: Json | null
          distance?: Database["public"]["Enums"]["sprint_distance"] | null
          id?: string
          intensity?: string | null
          phase?: Database["public"]["Enums"]["training_phase"] | null
          recovery?: string | null
          sequence_order?: number
          sessions_per_week?: number
          theme?: string | null
          title?: string
          training_phase?: string | null
          type?: Database["public"]["Enums"]["workout_type"] | null
          updated_at?: string
          week_type?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          color: string | null
          created_at: string
          date: string | null
          description: string | null
          details: Json | null
          distance: Database["public"]["Enums"]["sprint_distance"] | null
          duration: string | null
          feedback: Json | null
          id: string
          intensity: string | null
          phase: Database["public"]["Enums"]["training_phase"] | null
          program_id: string | null
          recovery: string | null
          theme: string | null
          time: string | null
          title: string
          type: Database["public"]["Enums"]["workout_type"] | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          details?: Json | null
          distance?: Database["public"]["Enums"]["sprint_distance"] | null
          duration?: string | null
          feedback?: Json | null
          id?: string
          intensity?: string | null
          phase?: Database["public"]["Enums"]["training_phase"] | null
          program_id?: string | null
          recovery?: string | null
          theme?: string | null
          time?: string | null
          title: string
          type?: Database["public"]["Enums"]["workout_type"] | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          details?: Json | null
          distance?: Database["public"]["Enums"]["sprint_distance"] | null
          duration?: string | null
          feedback?: Json | null
          id?: string
          intensity?: string | null
          phase?: Database["public"]["Enums"]["training_phase"] | null
          program_id?: string | null
          recovery?: string | null
          theme?: string | null
          time?: string | null
          title?: string
          type?: Database["public"]["Enums"]["workout_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      competition_level: "local" | "regional" | "national" | "international"
      sprint_distance: "60" | "100" | "200" | "400"
      subscription_tier: "free" | "standard" | "premium"
      training_phase: "preparation" | "specific" | "competition"
      training_phase_description:
        | "preparation_generale"
        | "preparation_specifique"
        | "preparation_competition"
        | "saison_championnats"
      workout_phase: "preparation" | "specific" | "competition"
      workout_theme:
        | "aerobic"
        | "lactic"
        | "alactic"
        | "mobility"
        | "conditioning"
        | "power"
        | "competition"
      workout_type:
        | "resistance"
        | "speed"
        | "endurance"
        | "mobility"
        | "technical"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      competition_level: ["local", "regional", "national", "international"],
      sprint_distance: ["60", "100", "200", "400"],
      subscription_tier: ["free", "standard", "premium"],
      training_phase: ["preparation", "specific", "competition"],
      training_phase_description: [
        "preparation_generale",
        "preparation_specifique",
        "preparation_competition",
        "saison_championnats",
      ],
      workout_phase: ["preparation", "specific", "competition"],
      workout_theme: [
        "aerobic",
        "lactic",
        "alactic",
        "mobility",
        "conditioning",
        "power",
        "competition",
      ],
      workout_type: [
        "resistance",
        "speed",
        "endurance",
        "mobility",
        "technical",
      ],
    },
  },
} as const
