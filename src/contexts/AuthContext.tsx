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
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session check:", session);
        
        if (session?.user && mounted) {
          console.log("Found existing session, fetching profile for:", session.user.id);
          const userProfile = await fetchProfile(session.user.id);
          if (userProfile && mounted) {
            console.log("Setting profile:", userProfile);
            setProfile(userProfile);
          } else {
            console.log("No profile found for user");
            setProfile(null);
          }
        } else {
          console.log("No session found");
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setProfile(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' && session?.user && mounted) {
        try {
          console.log("User signed in, fetching profile for:", session.user.id);
          const userProfile = await fetchProfile(session.user.id);
          if (userProfile && mounted) {
            console.log("Setting profile after sign in:", userProfile);
            setProfile(userProfile);
          } else {
            console.log("No profile found after sign in");
            setProfile(null);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          setProfile(null);
        }
      } else if (event === 'SIGNED_OUT' && mounted) {
        console.log("User signed out");
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, setProfile]);

  const login = async (email: string, password: string, role: string) => {
    try {
      console.log("Attempting login with:", { email, role });
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

  const contextValue = {
    user: profile,
    login,
    logout,
    isAuthenticated: !!profile
  };

  return (
    <AuthContext.Provider value={contextValue}>
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