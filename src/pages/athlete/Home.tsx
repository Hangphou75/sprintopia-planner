import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InvitationsList } from "@/components/athlete/InvitationsList";
import { ProgramWorkoutCalendar } from "@/components/programs/ProgramWorkoutCalendar";
import { format, startOfWeek, endOfWeek, isWithinInterval, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { CompetitionCard } from "@/components/programs/CompetitionCard";
import { Trophy, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Home = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

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

  const todayWorkout = activeProgram?.workouts.find(workout => 
    workout.date && isSameDay(new Date(workout.date), today)
  );

  const upcomingCompetition = activeProgram?.competitions.find(competition =>
    competition.date && isWithinInterval(new Date(competition.date), {
      start: weekStart,
      end: weekEnd
    })
  );

  if (isLoadingActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chargement...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      <InvitationsList />

      {activeProgram ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Programme en cours</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgramCard program={activeProgram.program} readOnly />
            </CardContent>
          </Card>

          {todayWorkout && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Séance du jour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{todayWorkout.title}</h3>
                    {todayWorkout.theme && (
                      <Badge variant="outline" className="mt-1">
                        {todayWorkout.theme}
                      </Badge>
                    )}
                  </div>
                  {todayWorkout.description && (
                    <p className="text-muted-foreground">{todayWorkout.description}</p>
                  )}
                  {todayWorkout.time && (
                    <p className="text-sm text-muted-foreground">
                      Heure : {todayWorkout.time}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {upcomingCompetition && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Compétition cette semaine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CompetitionCard
                  competition={upcomingCompetition}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </CardContent>
            </Card>
          )}
          
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
    </div>
  );
};

export default Home;