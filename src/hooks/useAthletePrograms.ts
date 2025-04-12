
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
      
      // Récupérer les programmes partagés avec l'athlète
      const { data: sharedProgramsData, error: sharedError } = await supabase
        .from("shared_programs")
        .select(`
          id,
          program_id,
          coach_id,
          athlete_id,
          created_at,
          status,
          programs:program_id (
            id,
            name,
            duration,
            objectives,
            start_date,
            phase,
            training_phase,
            user_id,
            created_at,
            updated_at,
            phase_duration,
            main_distance,
            sessions_per_week,
            training_days,
            main_competition,
            intermediate_competitions,
            generated,
            folder_id
          )
        `)
        .eq("athlete_id", userId)
        .eq("status", "active");

      if (sharedError) {
        console.error("Error fetching shared programs:", sharedError);
        toast.error("Erreur lors du chargement des programmes");
        throw sharedError;
      }

      console.log("Fetched shared programs raw data:", sharedProgramsData);

      if (!sharedProgramsData || sharedProgramsData.length === 0) {
        console.log("No shared programs found for athlete:", userId);
        return [];
      }

      // Transformer les données pour correspondre au type Program
      const programs = sharedProgramsData.map(sp => {
        // Process main_competition to ensure it matches the expected structure
        let mainCompetition = null;
        if (sp.programs?.main_competition) {
          const mc = sp.programs.main_competition as any;
          mainCompetition = {
            name: mc.name || '',
            date: mc.date || '',
            location: mc.location || ''
          };
        }

        // Process intermediate_competitions to ensure it matches the expected structure
        let intermediateCompetitions = null;
        if (sp.programs?.intermediate_competitions && Array.isArray(sp.programs.intermediate_competitions)) {
          intermediateCompetitions = sp.programs.intermediate_competitions.map((comp: any) => ({
            name: comp.name || '',
            date: comp.date || '',
            location: comp.location || ''
          }));
        }

        if (!sp.programs) {
          console.error("Missing program data for shared program:", sp);
          return null;
        }

        return {
          ...sp.programs,
          main_competition: mainCompetition,
          intermediate_competitions: intermediateCompetitions,
          shared_id: sp.id,
          coach_id: sp.coach_id
        };
      }).filter(Boolean);
      
      console.log("Transformed programs for athlete:", programs);
      return programs as Program[];
    },
    enabled: !!userId,
  });
};
