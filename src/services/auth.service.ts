import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserRole = "athlete" | "coach";

export const authService = {
  login: async (email: string, password: string, role: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("Aucune donnée utilisateur");

      return data.user;
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message);
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  getCurrentSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
};