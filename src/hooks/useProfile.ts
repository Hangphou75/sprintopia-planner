
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "athlete" | "coach" | "individual_athlete";
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
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const session = supabase.auth.getSession();
    if (session) {
      const cachedProfile = localStorage.getItem('userProfile');
      return cachedProfile ? JSON.parse(cachedProfile) : null;
    }
    return null;
  });

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log("Fetching profile for user:", userId);
      
      if (!userId) {
        console.error("No user ID provided");
        return null;
      }

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
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      setProfile(userProfile);
      return userProfile;
    } catch (error: any) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  }, []);

  return { profile, fetchProfile, setProfile };
}
