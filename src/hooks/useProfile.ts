
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "athlete" | "coach" | "individual_athlete" | "admin";
export type SubscriptionTier = "free" | "standard" | "premium";

export interface UserProfile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  role: UserRole;
  subscription_tier?: SubscriptionTier;
  subscription_expiry?: string | null;
  max_athletes?: number | null;
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const initialized = useRef(false);
  const fetchingRef = useRef(false);
  
  // Initialize from localStorage if available, inside useEffect
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    try {
      const cachedProfile = localStorage.getItem('userProfile');
      if (cachedProfile) {
        const parsedProfile = JSON.parse(cachedProfile);
        console.log("Initialized profile from cache:", parsedProfile.role);
        setProfile(parsedProfile);
      }
    } catch (error) {
      console.error("Error initializing profile from cache:", error);
      // Si le cache est corrompu, le supprimer
      localStorage.removeItem('userProfile');
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!userId) {
      console.error("No user ID provided");
      return null;
    }
    
    if (fetchingRef.current) {
      console.log("Profile fetch already in progress, skipping duplicate request");
      return null;
    }
    
    fetchingRef.current = true;
    
    try {
      console.log("Fetching profile for user:", userId);

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      if (!profileData) {
        console.error("No profile found for user:", userId);
        return null;
      }

      console.log("Profile data retrieved:", profileData);

      const userProfile: UserProfile = {
        id: profileData.id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        bio: profileData.bio,
        role: profileData.role as UserRole || 'athlete',
        subscription_tier: profileData.subscription_tier as SubscriptionTier || 'free',
        subscription_expiry: profileData.subscription_expiry,
        max_athletes: profileData.max_athletes,
      };

      console.log("Processed user profile:", userProfile);
      
      // Sauvegarder dans localStorage
      try {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
      } catch (storageError) {
        console.error('Error saving profile to localStorage:', storageError);
      }
      
      setProfile(userProfile);
      return userProfile;
    } catch (error: any) {
      console.error('Error in fetchProfile:', error);
      return null;
    } finally {
      setTimeout(() => {
        fetchingRef.current = false;
      }, 200);
    }
  }, []);

  return { profile, fetchProfile, setProfile };
}
