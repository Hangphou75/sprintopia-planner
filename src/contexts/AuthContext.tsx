
import React, { createContext, useContext, useEffect, useState } from "react";
import { useProfile, UserProfile } from "@/hooks/useProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
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
  const [isInitLoading, setIsInitLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Function to handle profile refresh
  const refreshUserProfile = async (userId: string) => {
    if (!userId) return null;
    
    try {
      console.log("Refreshing profile for user:", userId);
      const userProfile = await fetchProfile(userId);
      if (userProfile) {
        console.log("Profile refreshed successfully:", userProfile.role);
        setProfile(userProfile);
        return userProfile;
      } else {
        console.log("No profile found during refresh");
        return null;
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
      return null;
    }
  };

  // Check session on mount to ensure we're properly initialized
  useEffect(() => {
    let isMounted = true;
    let visibilityChangeHandler: null | ((e: Event) => void) = null;
    
    const checkSession = async () => {
      try {
        // Initialize from localStorage if available
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile && isMounted) {
          setProfile(JSON.parse(cachedProfile));
        }
        
        const { data } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        console.log("Initial session check:", data.session ? "Found session" : "No session");
        
        if (data.session) {
          try {
            // Force refresh profile on initial load
            await refreshUserProfile(data.session.user.id);
          } catch (error) {
            console.error("Error refreshing profile:", error);
            if (isMounted) setProfile(null);
          }
        } else {
          if (isMounted) setProfile(null);
        }
        
        if (isMounted) {
          setInitialized(true);
          setIsInitLoading(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (isMounted) {
          setProfile(null);
          setInitialized(true);
          setIsInitLoading(false);
        }
      }
    };
    
    // Function to handle visibility change (tab switch)
    visibilityChangeHandler = async () => {
      if (document.visibilityState === 'visible') {
        console.log("Tab became visible, checking auth session");
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user?.id) {
            // Refresh the profile when tab becomes visible
            await refreshUserProfile(data.session.user.id);
          }
        } catch (error) {
          console.error("Error handling visibility change:", error);
        }
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          await refreshUserProfile(session.user.id);
        } catch (error) {
          console.error("Error fetching profile after state change:", error);
        }
      } else if (event === 'SIGNED_OUT' && isMounted) {
        setProfile(null);
      }
    });
    
    // Add visibility change listener to handle tab switching
    document.addEventListener('visibilitychange', visibilityChangeHandler);
    
    // Force initialization to prevent infinite loading
    const timer = setTimeout(() => {
      if (isMounted && isInitLoading) {
        console.log("Forcing initialization after timeout");
        setInitialized(true);
        setIsInitLoading(false);
      }
    }, 2000); // Reduced timeout to 2 seconds
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      
      if (visibilityChangeHandler) {
        document.removeEventListener('visibilitychange', visibilityChangeHandler);
      }
      clearTimeout(timer);
    };
  }, [fetchProfile, setProfile, isInitLoading]);

  console.log("AuthProvider - Current state:", { 
    hasProfile: !!profile, 
    profileRole: profile?.role,
    isLoading: isInitLoading || sessionLoading || !initialized,
    initialized
  });

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
    isLoading: (isInitLoading || sessionLoading || !initialized)
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
