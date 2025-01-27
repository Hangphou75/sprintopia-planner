import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Program } from "@/types/program";
import { toast } from "sonner";
import { ProgramWorkoutCalendar } from "@/components/programs/ProgramWorkoutCalendar";

const AthletePlanning = () => {
  const { user } = useAuth();

  const { data: activeProgram, isLoading: isLoadingActive } = useQuery({
    queryKey: ["active-program", user?.id],
    queryFn: async () => {
      console.log("Fetching active program for user:", user?.id);
      
      const { data: activeProgram, error } = await supabase
        .from("active_programs")
        .select(`
          program:programs (
            *,
            workouts (*),
            competitions (*),
            coach:profiles!programs_user_id_fkey (
              first_name,
              last_name
            )
          )
        `)
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching active program:", error);
        throw error;
      }

      console.log("Active program raw data:", activeProgram);
      return activeProgram?.program;
    },
    enabled: !!user?.id,
  });

  const { data: sharedPrograms, isLoading: isLoadingShared } = useQuery({
    queryKey: ["shared-programs", user?.id],
    queryFn: async () => {
      console.log("Fetching shared programs for user:", user?.id);
      
      const { data: sharedProgramsData, error: sharedError } = await supabase
        .from("shared_programs")
        .select(`
          program:programs (
            *,
            workouts (*),
            competitions (*),
            coach:profiles!programs_user_id_fkey (
              first_name,
              last_name
            )
          )
        `)
        .eq("athlete_id", user?.id)
        .eq("status", "active");

      if (sharedError) {
        console.error("Error fetching shared programs:", sharedError);
        throw sharedError;
      }

      console.log("Shared programs raw data:", sharedProgramsData);
      return sharedProgramsData.map((sp: any) => sp.program);
    },
    enabled: !!user?.id,
  });

  const isLoading = isLoadingActive || isLoadingShared;

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement des programmes...</p>
        </div>
      </div>
    );
  }

  const currentProgram = activeProgram || (sharedPrograms && sharedPrograms[0]);
  console.log("Current program with competitions:", currentProgram);

  if (!currentProgram && (!sharedPrograms || sharedPrograms.length === 0)) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-5xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">Mon planning</h1>
          <p className="text-muted-foreground">Aucun programme actif ou partagé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mon planning</h1>
      </div>

      {currentProgram && (
        <ProgramWorkoutCalendar
          workouts={currentProgram.workouts || []}
          competitions={currentProgram.competitions || []}
          programId={currentProgram.id}
        />
      )}

      {sharedPrograms && sharedPrograms.length > 0 && !currentProgram && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sharedPrograms.map((program) => (
            <ProgramCard 
              key={program.id} 
              program={program}
              readOnly
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AthletePlanning;