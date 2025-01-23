import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserRole = "athlete" | "coach";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      if (!userId) {
        throw new Error('No user ID provided');
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!profileData) throw new Error('No profile found');

      const userProfile: UserProfile = {
        id: profileData.id,
        name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Utilisateur',
        email: profileData.email || '',
        role: (profileData.role as UserRole) || 'athlete',
      };

      setProfile(userProfile);
      return userProfile;
    } catch (error: any) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  return { profile, fetchProfile, setProfile };
};