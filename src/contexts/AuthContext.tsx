
import React, { createContext, useContext, useEffect, useState } from "react";
import { useProfile, UserProfile } from "@/hooks/useProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAuthInit } from "@/hooks/useAuthInit";
import { supabase } from "@/integrations/supabase/client";

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
        setInitialized(true);
      } catch (error) {
        console.error("Error checking session:", error);
        setInitialized(true);
      }
    };
    
    checkSession();
  }, []);

  console.log("AuthProvider - Current state:", { 
    hasProfile: !!profile, 
    isLoading: initLoading || sessionLoading,
    initialized
  });

  // Add an effect to log authentication state changes
  useEffect(() => {
    console.log("AuthProvider - Authentication state updated:", {
      hasProfile: !!profile,
      isLoading: initLoading || sessionLoading,
      initialized
    });
  }, [profile, initLoading, sessionLoading, initialized]);

  const login = async (email: string, password: string, role: string) => {
    try {
      await authLogin(email, password, role);
    } catch (error) {
      console.error("Login error in context:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authLogout();
      setProfile(null);
    } catch (error) {
      console.error("Logout error in context:", error);
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
