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
      console.log("Fetching profile for user:", userId);
      
      if (!userId) {
        console.error("No user ID provided");
        toast.error("Erreur: ID utilisateur manquant");
        throw new Error('No user ID provided');
      }

      // Correction de la requête Supabase
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error(`Erreur lors de la récupération du profil: ${error.message}`);
        throw error;
      }

      if (!profileData) {
        console.error("No profile found for user:", userId);
        toast.error("Profil non trouvé");
        return null;
      }

      console.log("Profile data retrieved:", profileData);

      const userProfile: UserProfile = {
        id: profileData.id,
        name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Utilisateur',
        email: profileData.email || '',
        role: profileData.role as UserRole || 'athlete',
      };

      console.log("Processed user profile:", userProfile);
      setProfile(userProfile);
      return userProfile;
    } catch (error: any) {
      console.error('Error in fetchProfile:', error);
      toast.error(`Erreur de connexion: ${error.message}`);
      return null;
    }
  };

  return { profile, fetchProfile, setProfile };
};