import React, { createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile, UserProfile } from "@/hooks/useProfile";

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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log("Initial session found:", session);
        await fetchProfile(session.user.id);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("User signed in, fetching profile...");
        const userProfile = await fetchProfile(session.user.id);
        if (userProfile) {
          navigate(`/${userProfile.role}/home`);
          toast.success("Connexion réussie");
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
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
      console.log("Attempting login with:", { email, role });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        toast.error("Erreur de connexion: " + error.message);
        throw error;
      }

      console.log("Login successful:", data);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erreur lors de la connexion");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
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