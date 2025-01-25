import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Program } from "@/types/program";

const AthletePlanning = () => {
  const { user } = useAuth();

  // Fetch shared programs
  const { data: sharedPrograms } = useQuery({
    queryKey: ["shared-programs", user?.id],
    queryFn: async () => {
      const { data: sharedProgramsData, error: sharedError } = await supabase
        .from("shared_programs")
        .select(`
          program:programs(
            *,
            competitions(*),
            coach:profiles!programs_user_id_fkey(
              first_name,
              last_name
            )
          )
        `)
        .eq("athlete_id", user?.id)
        .eq("status", "active");

      if (sharedError) throw sharedError;

      // Transform the data to match the Program type
      return sharedProgramsData.map((sp: any) => ({
        ...sp.program,
        coachName: `${sp.program.coach.first_name} ${sp.program.coach.last_name}`,
      })) as Program[];
    },
  });

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes programmes</h1>
      </div>
      <ScrollArea className="flex-1 px-1">
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
      </ScrollArea>
    </div>
  );
};

export default AthletePlanning;