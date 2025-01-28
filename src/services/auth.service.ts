import { supabase } from "@/integrations/supabase/client";

export type UserRole = "athlete" | "coach";

export const authService = {
  login: async (email: string, password: string, role: string) => {
    try {
      console.log("Auth service: attempting login", { email, role });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Auth service: login error", error);
        throw error;
      }
      
      if (!data.user) {
        console.error("Auth service: no user data returned");
        throw new Error("Aucune donnée utilisateur");
      }

      console.log("Auth service: login successful", data.user);
      return data.user;
    } catch (error: any) {
      console.error("Auth service: login error", error);
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Email ou mot de passe incorrect");
      }
      throw error;
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Auth service: logout error", error);
      throw error;
    }
  },

  getCurrentSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        throw error;
      }
      console.log("Current session:", session);
      return session;
    } catch (error) {
      console.error("Error getting session:", error);
      throw error;
    }
  },

  refreshSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Error refreshing session:", error);
        throw error;
      }
      return session;
    } catch (error) {
      console.error("Error refreshing session:", error);
      throw error;
    }
  }
};