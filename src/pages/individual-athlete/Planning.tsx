
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProgramWorkoutCalendar } from "@/components/programs/ProgramWorkoutCalendar";
import { Button } from "@/components/ui/button";
import { Plus, Wand2 } from "lucide-react";

const IndividualAthletePlanning = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: sharedPrograms, isLoading } = useQuery({
    queryKey: ["shared-programs", user?.id],
    queryFn: async () => {
      console.log("Fetching programs for user:", user?.id);
      
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

      console.log("All workouts:", allWorkouts);
      console.log("All competitions:", allCompetitions);

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
        <h1 className="text-3xl font-bold">Mes programmes</h1>
        <div className="flex gap-2">
          {user?.role === "individual_athlete" && (
            <>
              <Button
                variant="outline"
                onClick={() => navigate("/individual-athlete/programs/generate")}
                className="flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                <span className="hidden sm:inline">Générer un programme</span>
              </Button>
              <Button
                onClick={() => navigate("/individual-athlete/programs/new")}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nouveau programme</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {sharedPrograms?.programs?.length > 0 ? (
        <ProgramWorkoutCalendar
          workouts={sharedPrograms.workouts}
          competitions={sharedPrograms.competitions}
          programId={sharedPrograms.programs[0]?.id}
        />
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground">Aucun programme</p>
        </div>
      )}
    </div>
  );
};

export default IndividualAthletePlanning;
