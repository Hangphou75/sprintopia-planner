
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Program } from "@/types/program";
import { toast } from "sonner";

export const useAthletePrograms = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["athlete-programs", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("No user ID provided to useAthletePrograms");
        return [];
      }
      
      console.log("Fetching programs for athlete:", userId);
      
      // On récupère les programmes partagés avec l'athlète
      const { data: sharedProgramsData, error: sharedError } = await supabase
        .from("shared_programs")
        .select(`
          id,
          program_id,
          coach_id,
          athlete_id,
          created_at,
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

      console.log("Fetched shared programs:", sharedProgramsData);

      // Transformer les données pour correspondre au type Program
      return sharedProgramsData.map(sp => ({
        ...sp.programs,
        shared_id: sp.id,
        coach_id: sp.coach_id
      })) as Program[];
    },
    enabled: !!userId,
  });
};
