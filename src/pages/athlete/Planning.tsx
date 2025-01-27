import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProgramWorkoutCalendar } from "@/components/programs/ProgramWorkoutCalendar";

const AthletePlanning = () => {
  const { user } = useAuth();

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
            workouts (*),
            competitions (*)
          )
        `)
        .eq("athlete_id", user?.id)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching shared programs:", error);
        throw error;
      }

      console.log("Shared programs data:", sharedProgramsData);
      return sharedProgramsData.map((sp: any) => sp.program);
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

  // Combine all workouts and competitions from shared programs
  const allWorkouts = sharedPrograms?.flatMap(program => program.workouts || []) || [];
  const allCompetitions = sharedPrograms?.flatMap(program => program.competitions || []) || [];

  // Use the first program's ID as a reference (needed for routing)
  const firstProgramId = sharedPrograms?.[0]?.id;

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mon planning</h1>
      </div>

      {firstProgramId ? (
        <ProgramWorkoutCalendar
          workouts={allWorkouts}
          competitions={allCompetitions}
          programId={firstProgramId}
        />
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground">Aucun programme partagé</p>
        </div>
      )}
    </div>
  );
};

export default AthletePlanning;