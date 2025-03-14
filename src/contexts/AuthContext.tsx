
import React, { createContext, useContext, useEffect } from "react";
import { useProfile, UserProfile } from "@/hooks/useProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAuthInit } from "@/hooks/useAuthInit";

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

  console.log("AuthProvider - Current state:", { 
    hasProfile: !!profile, 
    isLoading: initLoading || sessionLoading 
  });

  // Add an effect to log authentication state changes
  useEffect(() => {
    console.log("AuthProvider - Authentication state updated:", {
      hasProfile: !!profile,
      isLoading: initLoading || sessionLoading
    });
  }, [profile, initLoading, sessionLoading]);

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
    isLoading: initLoading || sessionLoading
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
