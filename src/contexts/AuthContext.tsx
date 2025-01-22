import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
    // Vérifier la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session);
      if (!session) {
        setUser(null);
        navigate('/login');
      }
    });

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          console.log("Profile fetch result:", { profile, error });

          if (error) {
            console.error('Error fetching profile:', error);
            setUser(null);
            navigate('/login');
            return;
          }

          if (!profile) {
            console.error('No profile found');
            setUser(null);
            navigate('/login');
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

          if (event === 'SIGNED_IN') {
            navigate(`/${profile.role}/home`);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUser(null);
          navigate('/login');
        }
      } else {
        console.log("No session, clearing user");
        setUser(null);
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string, role: UserRole) => {
    console.log("Attempting login with:", { email, role });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      throw error;
    }

    console.log("Login successful:", data);
  };

  const logout = async () => {
    console.log("Logging out");
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
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