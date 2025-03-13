
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Program } from "@/types/program";
import { useAuth } from "@/contexts/AuthContext";

export const usePrograms = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["programs", user?.id, user?.role],
    queryFn: async () => {
      console.log("Fetching programs for user:", user?.id, "role:", user?.role);
      
      if (!user?.id) {
        console.error("No user ID provided to usePrograms");
        return [];
      }
      
      // Check if user is admin
      const isAdmin = user?.role === "admin";
      console.log("User is admin:", isAdmin);
      
      let query = supabase
        .from("programs")
        .select(`
          *,
          competitions(*),
          shared_programs(
            athlete:profiles!shared_programs_athlete_id_fkey(
              id,
              first_name,
              last_name,
              email
            )
          ),
          coach:profiles!programs_user_id_fkey(
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false });
      
      // For regular coaches, fetch only their programs
      // For admins, fetch all programs
      if (!isAdmin) {
        query = query.eq("user_id", user.id);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching programs:", error);
        throw error;
      }

      console.log("Raw programs data:", data);
      console.log("Number of programs fetched:", data?.length || 0);

      // Transform the data to match the Program type
      const transformedData: Program[] = (data || []).map((program: any) => ({
        ...program,
        main_competition: program.main_competition ? {
          name: program.main_competition.name || '',
          date: program.main_competition.date || '',
          location: program.main_competition.location || '',
        } : null,
        intermediate_competitions: program.intermediate_competitions ? 
          program.intermediate_competitions.map((comp: any) => ({
            name: comp.name || '',
            date: comp.date || '',
            location: comp.location || '',
          })) : null,
        shared_programs: program.shared_programs,
        id: program.id,
        name: program.name,
        duration: program.duration,
        objectives: program.objectives,
        start_date: program.start_date,
        created_at: program.created_at,
        updated_at: program.updated_at,
        user_id: program.user_id,
        training_phase: program.training_phase,
        phase_duration: program.phase_duration,
        main_distance: program.main_distance,
        generated: program.generated,
      }));

      console.log("Programs fetched:", transformedData);
      return transformedData;
    },
    enabled: !!user?.id,
  });
};
