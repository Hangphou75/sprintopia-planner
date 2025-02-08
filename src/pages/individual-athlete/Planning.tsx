
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProgramWorkoutCalendar } from "@/components/programs/ProgramWorkoutCalendar";
import { Button } from "@/components/ui/button";
import { Plus, Wand2 } from "lucide-react";

const IndividualAthletePlanning = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: programs, isLoading } = useQuery({
    queryKey: ["programs", user?.id],
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
            details,
            phase,
            intensity,
            recovery
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
        .eq("user_id", user?.id)
        .order('created_at', { ascending: false });

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

  const handleNewProgram = () => {
    console.log("Navigating to new program form...");
    queryClient.invalidateQueries({ queryKey: ["programs", user?.id] });
    navigate("/individual-athlete/programs/new");
  };

  const handleGenerateProgram = () => {
    console.log("Navigating to program generation...");
    queryClient.invalidateQueries({ queryKey: ["programs", user?.id] });
    navigate("/individual-athlete/programs/generate");
  };

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
                onClick={handleGenerateProgram}
                className="flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                <span className="hidden sm:inline">Générer un programme</span>
              </Button>
              <Button
                onClick={handleNewProgram}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nouveau programme</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {programs?.programs?.length > 0 ? (
        <ProgramWorkoutCalendar
          workouts={programs.workouts}
          competitions={programs.competitions}
          programId={programs.programs[0]?.id}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ["programs", user?.id] })}
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
