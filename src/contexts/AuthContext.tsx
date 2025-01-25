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
      navigate(redirectPath);
    } else {
      console.log("No profile, redirecting to login");
      navigate("/login");
    }
  };

  const handleAuthError = async (error: any) => {
    console.error("Auth error:", error);
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage.includes('refresh_token_not_found') || 
        errorMessage.includes('invalid token') || 
        errorMessage.includes('jwt expired')) {
      console.log("Session invalid, clearing and redirecting to login");
      await authService.logout();
      setProfile(null);
      navigate("/login");
      toast.error("Session expirée, veuillez vous reconnecter");
    } else {
      console.error("Unexpected auth error:", error);
      toast.error("Une erreur est survenue, veuillez réessayer");
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
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setProfile(null);
        navigate("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      navigate("/login");
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