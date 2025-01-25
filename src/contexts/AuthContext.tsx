import React, { createContext, useContext } from "react";
import { toast } from "sonner";
import { useProfile, UserProfile } from "@/hooks/useProfile";
import { authService } from "@/services/auth.service";
import { useAuthState } from "@/hooks/useAuthState";

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile();
  const { isLoading } = useAuthState();

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