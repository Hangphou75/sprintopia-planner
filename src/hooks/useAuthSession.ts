import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthSession = () => {
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string, role: string) => {
    setIsLoading(true);
    try {
      console.log("Auth service: attempting login", { email, role });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("Aucune donnée utilisateur");

      toast.success("Connexion réussie");
      return data.user;
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Email ou mot de passe incorrect");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    login,
    logout,
    isLoading
  };
};