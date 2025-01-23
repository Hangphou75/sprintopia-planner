import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type UserRole = "athlete" | "coach";

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
      console.log("Fetching profile for user:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error("Erreur lors de la récupération du profil");
        return null;
      }

      if (!data) {
        console.error('No profile found for user:', userId);
        toast.error("Profil utilisateur non trouvé");
        return null;
      }

      const userProfile = {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        email: data.email || '',
        role: data.role as UserRole,
      };

      console.log("Profile fetched:", userProfile);
      setProfile(userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      toast.error("Erreur lors de la récupération du profil");
      return null;
    }
  };

  return { profile, fetchProfile, setProfile };
};