
import React, { createContext, useContext, useEffect, useState } from "react";
import { useProfile, UserProfile } from "@/hooks/useProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAuthInit } from "@/hooks/useAuthInit";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { profile, setProfile, fetchProfile } = useProfile();
  const { login: authLogin, logout: authLogout, isLoading: sessionLoading } = useAuthSession();
  const { isLoading: initLoading } = useAuthInit({
    onProfileUpdate: setProfile,
    fetchProfile,
  });
  const [initialized, setInitialized] = useState(false);

  // Check session on mount to ensure we're properly initialized
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Initial session check:", data.session ? "Found session" : "No session");
        
        if (data.session) {
          try {
            // Force refresh profile on initial load
            const userProfile = await fetchProfile(data.session.user.id);
            if (userProfile) {
              console.log("Profile loaded:", userProfile.role);
              setProfile(userProfile);
            } else {
              console.log("No profile found despite valid session");
            }
          } catch (error) {
            console.error("Error refreshing profile:", error);
          }
        }
        
        setInitialized(true);
      } catch (error) {
        console.error("Error checking session:", error);
        setInitialized(true);
      }
    };
    
    checkSession();
  }, [fetchProfile, setProfile]);

  console.log("AuthProvider - Current state:", { 
    hasProfile: !!profile, 
    profileRole: profile?.role,
    isLoading: initLoading || sessionLoading,
    initialized
  });

  // Add an effect to log authentication state changes
  useEffect(() => {
    console.log("AuthProvider - Authentication state updated:", {
      hasProfile: !!profile,
      profileRole: profile?.role,
      isLoading: initLoading || sessionLoading,
      initialized
    });
  }, [profile, initLoading, sessionLoading, initialized]);

  const login = async (email: string, password: string, role: string) => {
    try {
      await authLogin(email, password, role);
      toast.success("Connexion réussie");
    } catch (error) {
      console.error("Login error in context:", error);
      toast.error("Échec de la connexion");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authLogout();
      setProfile(null);
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Logout error in context:", error);
      toast.error("Échec de la déconnexion");
      throw error;
    }
  };

  const value = {
    user: profile,
    login,
    logout,
    isAuthenticated: !!profile,
    isLoading: initLoading || sessionLoading || !initialized
  };

  return (
    <AuthContext.Provider value={value}>
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
