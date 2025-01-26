import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useProfile, UserProfile } from "@/hooks/useProfile";
import { authService } from "@/services/auth.service";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const { profile, setProfile, fetchProfile } = useProfile();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } catch (error) {
          console.error("Error fetching profile:", error);
          setProfile(null);
        }
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, setProfile]);

  const login = async (email: string, password: string, role: string) => {
    try {
      await authService.login(email, password, role);
      toast.success("Connexion réussie");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Erreur de connexion: " + (error.message || "Email ou mot de passe incorrect"));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setProfile(null);
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");
      throw error;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  return (
    <AuthContext.Provider value={{
      user: profile,
      login,
      logout,
      isAuthenticated: !!profile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}