import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProgramWorkoutCalendar } from "@/components/programs/ProgramWorkoutCalendar";

const IndividualAthleteHome = () => {
  const { user } = useAuth();

  const { data: programs, isLoading } = useQuery({
    queryKey: ["programs", user?.id],
    queryFn: async () => {
      console.log("Fetching programs for individual athlete:", user?.id);
      
      const { data: programsData, error } = await supabase
        .from("programs")
        .select(`
          id,
          name,
          workouts (
            id,
            title,
            description,
            date,
            time,
            theme,
            details
          ),
          competitions (
            id,
            name,
            date,
            location,
            distance,
            level,
            is_main,
            time
          )
        `)
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error fetching programs:", error);
        throw error;
      }

      console.log("Programs data:", programsData);
      
      const allWorkouts = programsData?.reduce((acc, program) => {
        return acc.concat(program?.workouts || []);
      }, []);
      const allCompetitions = programsData?.reduce((acc, program) => {
        return acc.concat(program?.competitions || []);
      }, []);

      return {
        programs: programsData || [],
        workouts: allWorkouts || [],
        competitions: allCompetitions || []
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement des programmes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mon tableau de bord</h1>
      </div>

      {programs?.programs?.length > 0 ? (
        <ProgramWorkoutCalendar
          workouts={programs.workouts}
          competitions={programs.competitions}
          programId={programs.programs[0]?.id}
        />
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground">Aucun programme créé</p>
        </div>
      )}
    </div>
  );
};

export default IndividualAthleteHome;