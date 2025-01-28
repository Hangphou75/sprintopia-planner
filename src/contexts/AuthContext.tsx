import React, { createContext, useContext } from "react";
import { useProfile } from "@/hooks/useProfile";
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

  const login = async (email: string, password: string, role: string) => {
    await authLogin(email, password, role);
  };

  const logout = async () => {
    await authLogout();
    setProfile(null);
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