import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvitationsList } from "@/components/athlete/InvitationsList";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Home = () => {
  const { user } = useAuth();

  const { data: activeProgram, isLoading: isLoadingActive } = useQuery({
    queryKey: ["active-program", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("active_programs")
        .select(
          `
          *,
          programs (
            *
          )
        `
        )
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from("shared_programs")
        .update({ status: "active" })
        .eq("program_id", programId)
        .eq("athlete_id", user?.id)
        .eq("coach_id", coachId);

      if (error) throw error;

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

          {activeProgram?.programs ? (
            <Card>
              <CardHeader>
                <CardTitle>Programme en cours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">
                  {activeProgram.programs.name}
                </p>
              </CardContent>
            </Card>
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