
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
      
      // For admin user, we want to fetch all coach-athlete relationships
      let query;
      
      if (isAdmin) {
        // Admin sees all coach-athlete relationships
        query = await supabase
          .from("coach_athletes")
          .select(`
            *,
            coach:profiles!coach_athletes_coach_id_fkey(
              id,
              first_name,
              last_name,
              email
            ),
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
      } else {
        // Regular coach only sees their athletes
        query = await supabase
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
      }
      
      const { data, error } = query;

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
