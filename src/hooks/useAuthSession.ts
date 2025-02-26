
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthSession = () => {
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string, role: string) => {
    setIsLoading(true);
    try {
      console.log("Auth session: attempting login", { email, role });
      
      // Vérifions d'abord la connexion à Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session check error:", sessionError);
        throw sessionError;
      }
      console.log("Current session state:", session);

      // Tentative de connexion
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error details:", error);
        throw error;
      }

      if (!data.user) {
        console.error("No user data returned");
        throw new Error("Aucune donnée utilisateur");
      }

      console.log("Login successful:", data.user);
      toast.success("Connexion réussie");
      return data.user;
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Gestion plus détaillée des erreurs
      if (error.message?.includes("Invalid login credentials")) {
        toast.error("Email ou mot de passe incorrect");
        throw new Error("Email ou mot de passe incorrect");
      } else if (error.message?.includes("Failed to fetch")) {
        toast.error("Erreur de connexion au serveur. Veuillez réessayer.");
        throw new Error("Erreur de connexion au serveur");
      } else {
        toast.error("Erreur lors de la connexion : " + (error.message || "Erreur inconnue"));
        throw error;
      }
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
