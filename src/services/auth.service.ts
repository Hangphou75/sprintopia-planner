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
      throw new Error(error.message);
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Auth service: logout error", error);
      throw error;
    }
  },

  getCurrentSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
};