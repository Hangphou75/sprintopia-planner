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
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const userProfile = await fetchProfile(session.user.id);
          if (userProfile) {
            console.log("User profile fetched:", userProfile);
            const redirectPath = `/${userProfile.role}/home`;
            console.log("Redirecting to:", redirectPath);
            navigate(redirectPath, { replace: true });
          } else {
            console.error("No profile found after login");
            toast.error("Erreur lors de la récupération du profil");
            await authService.logout();
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast.error("Erreur lors de la récupération du profil");
          await authService.logout();
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setProfile(null);
        navigate('/login', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, fetchProfile, setProfile]);

  const login = async (email: string, password: string, role: string) => {
    try {
      console.log("Attempting login with:", { email, role });
      await authService.login(email, password, role);
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Erreur de connexion: " + error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
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