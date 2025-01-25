import React, { createContext, useContext, useEffect, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(true);

  const handleProfileFetch = async (userId: string) => {
    try {
      const userProfile = await fetchProfile(userId);
      if (userProfile) {
        console.log("Profile fetched successfully:", userProfile);
        return userProfile;
      }
      console.error("No profile found for user:", userId);
      return null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  const handleRedirect = (userProfile: UserProfile | null) => {
    if (userProfile) {
      const redirectPath = `/${userProfile.role}/home`;
      console.log("Redirecting to:", redirectPath);
      navigate(redirectPath, { replace: true });
    } else {
      console.log("No profile, redirecting to login");
      navigate("/login", { replace: true });
    }
  };

  const handleAuthError = async (error: any) => {
    console.error("Auth error:", error);
    if (error.message?.includes('refresh_token_not_found')) {
      console.log("Invalid refresh token, clearing session");
      await authService.logout();
      setProfile(null);
      navigate("/login", { replace: true });
      toast.error("Session expirée, veuillez vous reconnecter");
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await authService.getCurrentSession();
        if (session?.user) {
          const userProfile = await handleProfileFetch(session.user.id);
          if (userProfile) {
            handleRedirect(userProfile);
          }
        }
      } catch (error) {
        await handleAuthError(error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const userProfile = await handleProfileFetch(session.user.id);
          if (!userProfile) {
            toast.error("Erreur lors de la récupération du profil");
            await authService.logout();
          }
          handleRedirect(userProfile);
        } catch (error) {
          await handleAuthError(error);
        }
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        console.log("User signed out or token refreshed");
        setProfile(null);
        handleRedirect(null);
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

  if (isLoading) {
    return null;
  }

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