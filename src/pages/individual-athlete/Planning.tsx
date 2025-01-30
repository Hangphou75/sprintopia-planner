import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProgramWorkoutCalendar } from "@/components/programs/ProgramWorkoutCalendar";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";

const IndividualAthletePlanning = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: sharedPrograms, isLoading } = useQuery({
    queryKey: ["shared-programs", user?.id],
    queryFn: async () => {
      console.log("Fetching shared programs for user:", user?.id);
      
      const { data: sharedProgramsData, error } = await supabase
        .from("shared_programs")
        .select(`
          program:programs (
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
          )
        `)
        .eq("athlete_id", user?.id)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching shared programs:", error);
        throw error;
      }

      console.log("Shared programs data:", sharedProgramsData);
      
      const programs = sharedProgramsData?.map(sp => sp.program) || [];
      const allWorkouts = programs.reduce((acc, program) => {
        return acc.concat(program?.workouts || []);
      }, []);
      const allCompetitions = programs.reduce((acc, program) => {
        return acc.concat(program?.competitions || []);
      }, []);

      console.log("All workouts:", allWorkouts);
      console.log("All competitions:", allCompetitions);

      return {
        programs,
        workouts: allWorkouts,
        competitions: allCompetitions
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
        <h1 className="text-3xl font-bold">Mon planning</h1>
        {sharedPrograms?.programs?.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => navigate(`/individual-athlete/programs/${sharedPrograms.programs[0]?.id}/settings`)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden md:inline-flex"
              onClick={() => navigate(`/individual-athlete/programs/${sharedPrograms.programs[0]?.id}/settings`)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
            <Button
              size="icon"
              className="md:hidden"
              onClick={() => navigate(`/individual-athlete/programs/${sharedPrograms.programs[0]?.id}/workouts/new`)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              className="hidden md:inline-flex"
              onClick={() => navigate(`/individual-athlete/programs/${sharedPrograms.programs[0]?.id}/workouts/new`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle séance
            </Button>
          </div>
        )}
      </div>

      {sharedPrograms?.programs?.length > 0 ? (
        <ProgramWorkoutCalendar
          workouts={sharedPrograms.workouts}
          competitions={sharedPrograms.competitions}
          programId={sharedPrograms.programs[0]?.id}
        />
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground">Aucun programme partagé</p>
        </div>
      )}
    </div>
  );
};

export default IndividualAthletePlanning;