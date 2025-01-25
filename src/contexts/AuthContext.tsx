import React, { createContext, useContext, useState, useEffect } from "react";
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
  const { profile, setProfile } = useProfile();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await authService.getCurrentSession();
        if (!session?.user) {
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [setProfile]);

  const login = async (email: string, password: string, role: string) => {
    try {
      console.log("Attempting login with:", { email, role });
      await authService.login(email, password, role);
      console.log("Login successful");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Erreur de connexion: " + error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setProfile(null);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");
      throw error;
    }
  };

  const value = {
    user: profile,
    login,
    logout,
    isAuthenticated: !!profile && !isLoading
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

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