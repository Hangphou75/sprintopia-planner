import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Program } from "@/types/database";

export const useAthletePrograms = (athleteId: string | undefined) => {
  return useQuery({
    queryKey: ["athlete-programs", athleteId],
    queryFn: async () => {
      if (!athleteId) return [];
      
      const { data: sharedPrograms, error: sharedError } = await supabase
        .from("shared_programs")
        .select(`
          program:programs (
            id,
            name,
            duration,
            objectives,
            start_date,
            created_at,
            updated_at,
            user_id
          )
        `)
        .eq("athlete_id", athleteId);

      if (sharedError) throw sharedError;

      const programs = sharedPrograms
        .map(sp => sp.program)
        .filter((program): program is Program => program !== null);

      return programs;
    },
    enabled: !!athleteId,
  });
};