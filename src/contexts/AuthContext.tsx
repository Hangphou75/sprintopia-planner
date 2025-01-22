import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type UserRole = "athlete" | "coach";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchAndSetUserProfile(session.user.id);
      } else {
        setUser(null);
        navigate('/login');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchAndSetUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchAndSetUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log("Profile fetch result:", { profile, error });

      if (error) {
        console.error('Error fetching profile:', error);
        setUser(null);
        navigate('/login');
        toast.error("Erreur lors de la récupération du profil");
        return;
      }

      if (!profile) {
        console.error('No profile found for user:', userId);
        setUser(null);
        navigate('/login');
        toast.error("Profil utilisateur non trouvé");
        return;
      }

      const userData = {
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email || '',
        role: profile.role as UserRole,
      };

      console.log("Setting user data:", userData);
      setUser(userData);
      
      // Only navigate if we're not already on the correct route
      const targetRoute = `/${profile.role}/home`;
      if (window.location.pathname !== targetRoute) {
        navigate(targetRoute);
      }
    } catch (error) {
      console.error('Error in fetchAndSetUserProfile:', error);
      setUser(null);
      navigate('/login');
      toast.error("Erreur lors de la récupération du profil");
    }
  };

  const login = async (email: string, password: string, role: UserRole) => {
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
      setUser(null);
      navigate('/login');
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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