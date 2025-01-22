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
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchAndSetUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
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
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (profile) {
        console.log("Profile found:", profile);
        setUser({
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name}`,
          email: profile.email || '',
          role: profile.role as UserRole,
        });
        navigate(`/${profile.role}/home`);
      } else {
        console.error('No profile found');
        await supabase.auth.signOut();
        navigate('/login');
      }
    } catch (error) {
      console.error('Error in fetchAndSetUserProfile:', error);
      await supabase.auth.signOut();
      navigate('/login');
    }
  };

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      // First check if user exists with the correct role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', email)
        .single();

      if (profileError) {
        console.error('Error checking profile:', profileError);
        throw new Error('Invalid login credentials');
      }

      if (profile.role !== role) {
        throw new Error('Invalid role');
      }

      // If role is correct, proceed with login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error signing in:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      // fetchAndSetUserProfile will handle the profile fetching and navigation
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
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