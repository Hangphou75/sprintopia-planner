
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/database";

export const useAthletes = (coachId: string | undefined) => {
  return useQuery({
    queryKey: ["coach-athletes", coachId],
    queryFn: async () => {
      if (!coachId) {
        console.error("No coach ID provided to useAthletes");
        return [];
      }
      
      console.log("Fetching athletes for coach:", coachId);
      
      // Get user profile to check if admin
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", coachId)
        .single();
        
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
      }
      
      const isAdmin = userProfile?.role === "admin";
      console.log("User is admin:", isAdmin);
      
      // For admin users, fetch all athlete relationships
      const { data, error } = await supabase
        .from("coach_athletes")
        .select(`
          *,
          athlete:profiles!coach_athletes_athlete_id_fkey (
            id,
            email,
            first_name,
            last_name,
            bio,
            avatar_url,
            role,
            created_at,
            updated_at
          )
        `)
        .eq("coach_id", coachId);

      if (error) {
        console.error("Error fetching athletes:", error);
        throw error;
      }
      
      console.log("Athletes data fetched:", data);
      
      return data;
    },
    enabled: !!coachId,
  });
};
