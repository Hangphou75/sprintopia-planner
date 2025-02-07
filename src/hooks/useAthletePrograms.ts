
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Program } from "@/types/program";
import { toast } from "sonner";

export const useAthletePrograms = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["programs", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*, shared_programs(athlete:profiles!shared_programs_athlete_id_fkey(id, first_name, last_name, email))")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching programs:", error);
        toast.error("Erreur lors du chargement des programmes");
        throw error;
      }

      // Transform the data to match the Program type
      const transformedData = (data || []).map(program => ({
        ...program,
        main_competition: program.main_competition ? {
          name: (program.main_competition as any).name || '',
          date: (program.main_competition as any).date || '',
          location: (program.main_competition as any).location || '',
        } : null,
        intermediate_competitions: program.intermediate_competitions ? 
          program.intermediate_competitions.map((comp: any) => ({
            name: comp.name || '',
            date: comp.date || '',
            location: comp.location || '',
          })) : null
      }));

      return transformedData as Program[];
    },
    enabled: !!userId,
  });
};
