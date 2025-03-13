
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/database";

export const useAthletes = (coachId: string | undefined) => {
  return useQuery({
    queryKey: ["coach-athletes", coachId],
    queryFn: async () => {
      if (!coachId) return [];
      
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
      
      return data;
    },
    enabled: !!coachId,
  });
};
