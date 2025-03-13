
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
      
      console.log("Fetching athletes for coach/admin:", coachId);
      
      // Get user profile to check if admin
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", coachId)
        .single();
        
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw profileError;
      }
      
      const isAdmin = userProfile?.role === "admin";
      console.log("User is admin:", isAdmin);
      
      let query = supabase
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
        `);
      
      // For admins, fetch all athlete relationships
      // For regular coaches, fetch only their athletes
      if (!isAdmin) {
        query = query.eq("coach_id", coachId);
      }
      
      const { data, error } = await query;

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
