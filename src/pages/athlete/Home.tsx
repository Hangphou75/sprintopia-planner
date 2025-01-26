import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InvitationsList } from "@/components/athlete/InvitationsList";
import { ProgramWorkoutCalendar } from "@/components/programs/ProgramWorkoutCalendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

const Home = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: activeProgram, isLoading: isLoadingActive } = useQuery({
    queryKey: ["active-program", user?.id],
    queryFn: async () => {
      const { data: activeData, error: activeError } = await supabase
        .from("active_programs")
        .select(`
          *,
          program:programs (
            *
          )
        `)
        .eq("user_id", user?.id)
        .maybeSingle();

      if (activeError) throw activeError;

      if (activeData) {
        // Fetch workouts and competitions for the active program
        const [workoutsResponse, competitionsResponse] = await Promise.all([
          supabase
            .from("workouts")
            .select("*")
            .eq("program_id", activeData.program_id)
            .order("date", { ascending: true }),
          supabase
            .from("competitions")
            .select("*")
            .eq("program_id", activeData.program_id)
            .order("date", { ascending: true }),
        ]);

        if (workoutsResponse.error) throw workoutsResponse.error;
        if (competitionsResponse.error) throw competitionsResponse.error;

        return {
          ...activeData,
          workouts: workoutsResponse.data || [],
          competitions: competitionsResponse.data || [],
        };
      }

      return null;
    },
    enabled: !!user?.id,
  });

  const { data: sharedPrograms, isLoading: isLoadingShared } = useQuery({
    queryKey: ["shared-programs-pending", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shared_programs")
        .select(`
          *,
          programs (
            *
          ),
          coach:profiles!shared_programs_coach_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq("athlete_id", user?.id)
        .eq("status", "pending");

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleAcceptProgram = async (programId: string, coachId: string) => {
    try {
      // 1. Update shared program status
      const { error: updateError } = await supabase
        .from("shared_programs")
        .update({ status: "active" })
        .eq("program_id", programId)
        .eq("athlete_id", user?.id)
        .eq("coach_id", coachId);

      if (updateError) throw updateError;

      // 2. Create active program entry
      const { error: activeError } = await supabase
        .from("active_programs")
        .insert({
          user_id: user?.id,
          program_id: programId,
        });

      if (activeError) throw activeError;

      // 3. Refresh queries
      await queryClient.invalidateQueries({ queryKey: ["shared-programs-pending"] });
      await queryClient.invalidateQueries({ queryKey: ["active-program"] });

      toast.success("Programme accepté avec succès");
    } catch (error) {
      console.error("Error accepting program:", error);
      toast.error("Erreur lors de l'acceptation du programme");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      <InvitationsList />

      {(isLoadingActive || isLoadingShared) ? (
        <Card>
          <CardHeader>
            <CardTitle>Chargement...</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <>
          {sharedPrograms && sharedPrograms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Programmes en attente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sharedPrograms.map((shared) => (
                  <div
                    key={shared.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {shared.coach.first_name} {shared.coach.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        vous a partagé le programme "{shared.programs.name}"
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Envoyé le {format(new Date(shared.created_at), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleAcceptProgram(shared.program_id, shared.coach_id)}
                    >
                      Accepter
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeProgram ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Programme en cours</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold">
                    {activeProgram.program.name}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Calendrier des séances</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgramWorkoutCalendar
                    workouts={activeProgram.workouts}
                    competitions={activeProgram.competitions}
                    programId={activeProgram.program_id}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Aucun programme actif</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Vous n'avez pas encore de programme actif. Contactez votre coach pour en activer un.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
