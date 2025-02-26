
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Program } from "@/types/program";
import { toast } from "sonner";

export const useAthletePrograms = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["athlete-programs", userId],
    queryFn: async () => {
      // On récupère les programmes partagés avec l'athlète
      const { data: sharedProgramsData, error: sharedError } = await supabase
        .from("shared_programs")
        .select(`
          program_id,
          programs:programs!inner (
            id,
            name,
            duration,
            objectives,
            start_date,
            phase,
            training_phase,
            user_id,
            created_at,
            updated_at
          )
        `)
        .eq("athlete_id", userId);

      if (sharedError) {
        console.error("Error fetching shared programs:", sharedError);
        toast.error("Erreur lors du chargement des programmes");
        throw sharedError;
      }

      // Transformer les données pour correspondre au type Program
      return sharedProgramsData.map(sp => ({
        ...sp.programs,
      })) as Program[];
    },
    enabled: !!userId,
  });
};
