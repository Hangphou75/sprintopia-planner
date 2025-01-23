import React, { createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile, UserProfile } from "@/hooks/useProfile";
import { authService } from "@/services/auth.service";

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { profile, fetchProfile, setProfile } = useProfile();

  useEffect(() => {
    const initializeAuth = async () => {
      const session = await authService.getCurrentSession();
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userProfile = await fetchProfile(session.user.id);
        if (userProfile) {
          navigate(`/${userProfile.role}/home`);
          toast.success("Connexion réussie");
        } else {
          toast.error("Erreur lors de la récupération du profil");
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        navigate('/login');
        toast.success("Déconnexion réussie");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, fetchProfile, setProfile]);

  const login = async (email: string, password: string, role: string) => {
    try {
      await authService.login(email, password, role);
    } catch (error: any) {
      toast.error("Erreur de connexion: " + error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user: profile, 
        login, 
        logout, 
        isAuthenticated: !!profile 
      }}
    >
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