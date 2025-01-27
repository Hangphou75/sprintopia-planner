import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Program } from "@/types/program";
import { toast } from "sonner";

const AthletePlanning = () => {
  const { user } = useAuth();

  const { data: sharedPrograms, isLoading, error } = useQuery({
    queryKey: ["shared-programs-active", user?.id],
    queryFn: async () => {
      // First, get the active program for the athlete
      const { data: activeProgram, error: activeError } = await supabase
        .from("active_programs")
        .select(`
          program:programs (
            *,
            shared_programs (
              athlete:profiles!shared_programs_athlete_id_fkey (
                id,
                first_name,
                last_name,
                email
              )
            ),
            competitions(*),
            coach:profiles!programs_user_id_fkey (
              first_name,
              last_name
            )
          )
        `)
        .eq("user_id", user?.id)
        .maybeSingle();

      if (activeError) {
        console.error("Error fetching active program:", activeError);
        throw activeError;
      }

      // Then, get all shared programs for the athlete
      const { data: sharedProgramsData, error: sharedError } = await supabase
        .from("shared_programs")
        .select(`
          program:programs (
            *,
            shared_programs (
              athlete:profiles!shared_programs_athlete_id_fkey (
                id,
                first_name,
                last_name,
                email
              )
            ),
            competitions(*),
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

      // Combine active program with shared programs if it exists
      const programs = activeProgram?.program 
        ? [activeProgram.program, ...sharedProgramsData.map((sp: any) => sp.program)]
        : sharedProgramsData.map((sp: any) => sp.program);

      return programs.map((program: any) => ({
        ...program,
        coachName: program.coach ? `${program.coach.first_name} ${program.coach.last_name}` : 'Non assigné',
      })) as Program[];
    },
    enabled: !!user?.id,
  });

  if (error) {
    toast.error("Une erreur est survenue lors du chargement des programmes");
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center text-red-500">
          Une erreur est survenue lors du chargement des programmes. Veuillez réessayer.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes programmes</h1>
      </div>
      <ScrollArea className="flex-1 px-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Chargement des programmes...</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {!sharedPrograms || sharedPrograms.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-8">
                Aucun programme partagé
              </p>
            ) : (
              sharedPrograms.map((program) => (
                <ProgramCard 
                  key={program.id} 
                  program={program}
                  readOnly={true}
                />
              ))
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default AthletePlanning;