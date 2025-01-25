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
          created_at: string;
          id: string;
          program_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          program_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          program_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "active_programs_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "active_programs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      athlete_invitations: {
        Row: {
          id: string;
          coach_id: string;
          email: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          coach_id: string;
          email: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          coach_id?: string;
          email?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "athlete_invitations_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      shared_programs: {
        Row: {
          id: string;
          program_id: string;
          athlete_id: string;
          coach_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          athlete_id: string;
          coach_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          program_id?: string;
          athlete_id?: string;
          coach_id?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shared_programs_athlete_id_fkey";
            columns: ["athlete_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shared_programs_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shared_programs_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          }
        ];
      };
      competitions: {
        Row: {
          created_at: string;
          date: string;
          distance: Database["public"]["Enums"]["sprint_distance"];
          ffa_url: string | null;
          id: string;
          is_main: boolean | null;
          level: Database["public"]["Enums"]["competition_level"];
          location: string | null;
          name: string;
          program_id: string | null;
          time: string | null;
        };
        Insert: {
          created_at?: string;
          date: string;
          distance: Database["public"]["Enums"]["sprint_distance"];
          ffa_url?: string | null;
          id?: string;
          is_main?: boolean | null;
          level: Database["public"]["Enums"]["competition_level"];
          location?: string | null;
          name: string;
          program_id?: string | null;
          time?: string | null;
        };
        Update: {
          created_at?: string;
          date?: string;
          distance?: Database["public"]["Enums"]["sprint_distance"];
          ffa_url?: string | null;
          id?: string;
          is_main?: boolean | null;
          level?: Database["public"]["Enums"]["competition_level"];
          location?: string | null;
          name?: string;
          program_id?: string | null;
          time?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "competitions_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          email: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          role: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          role?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          role?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      programs: {
        Row: {
          created_at: string;
          duration: number;
          id: string;
          name: string;
          objectives: string | null;
          start_date: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          duration: number;
          id?: string;
          name: string;
          objectives?: string | null;
          start_date: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          duration?: number;
          id?: string;
          name?: string;
          objectives?: string | null;
          start_date?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "programs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      workout_feedback: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          perceived_difficulty: number | null;
          rating: number | null;
          updated_at: string;
          user_id: string | null;
          workout_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          perceived_difficulty?: number | null;
          rating?: number | null;
          updated_at?: string;
          user_id?: string | null;
          workout_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          perceived_difficulty?: number | null;
          rating?: number | null;
          updated_at?: string;
          user_id?: string | null;
          workout_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "workout_feedback_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_feedback_workout_id_fkey";
            columns: ["workout_id"];
            isOneToOne: false;
            referencedRelation: "workouts";
            referencedColumns: ["id"];
          }
        ];
      };
      workouts: {
        Row: {
          color: string | null;
          created_at: string;
          date: string | null;
          description: string | null;
          details: Json | null;
          distance: Database["public"]["Enums"]["sprint_distance"] | null;
          duration: string | null;
          feedback: Json | null;
          id: string;
          intensity: string | null;
          phase: Database["public"]["Enums"]["training_phase"] | null;
          program_id: string | null;
          recovery: string | null;
          theme: string | null;
          time: string | null;
          title: string;
          type: Database["public"]["Enums"]["workout_type"] | null;
          updated_at: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          date?: string | null;
          description?: string | null;
          details?: Json | null;
          distance?: Database["public"]["Enums"]["sprint_distance"] | null;
          duration?: string | null;
          feedback?: Json | null;
          id?: string;
          intensity?: string | null;
          phase?: Database["public"]["Enums"]["training_phase"] | null;
          program_id?: string | null;
          recovery?: string | null;
          theme?: string | null;
          time?: string | null;
          title: string;
          type?: Database["public"]["Enums"]["workout_type"] | null;
          updated_at?: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          date?: string | null;
          description?: string | null;
          details?: Json | null;
          distance?: Database["public"]["Enums"]["sprint_distance"] | null;
          duration?: string | null;
          feedback?: Json | null;
          id?: string;
          intensity?: string | null;
          phase?: Database["public"]["Enums"]["training_phase"] | null;
          program_id?: string | null;
          recovery?: string | null;
          theme?: string | null;
          time?: string | null;
          title?: string;
          type?: Database["public"]["Enums"]["workout_type"] | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workouts_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      competition_level: "local" | "regional" | "national" | "international";
      sprint_distance: "60" | "100" | "200" | "400";
      training_phase: "preparation" | "specific" | "competition";
      workout_theme:
        | "aerobic"
        | "lactic"
        | "alactic"
        | "mobility"
        | "conditioning"
        | "power"
        | "competition";
      workout_type:
        | "resistance"
        | "speed"
        | "endurance"
        | "mobility"
        | "technical";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
