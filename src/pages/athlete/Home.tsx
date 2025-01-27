import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvitationsList } from "@/components/athlete/InvitationsList";
import { ProgramWorkoutCalendar } from "@/components/programs/ProgramWorkoutCalendar";
import { format, startOfWeek, endOfWeek, isWithinInterval, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { CompetitionCard } from "@/components/programs/CompetitionCard";
import { Trophy, Timer, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Home = () => {
  const { user } = useAuth();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const { data: sharedPrograms, isLoading: isLoadingShared } = useQuery({
    queryKey: ["shared-programs", user?.id],
    queryFn: async () => {
      console.log("Fetching shared programs for user:", user?.id);
      
      const { data: sharedData, error: sharedError } = await supabase
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

      if (sharedError) {
        console.error("Error fetching shared programs:", sharedError);
        throw sharedError;
      }

      console.log("Shared programs data:", sharedData);

      // Transformer les données pour avoir une liste plate de séances et compétitions
      const allWorkouts = sharedData?.flatMap(sp => sp.program.workouts || []) || [];
      const allCompetitions = sharedData?.flatMap(sp => sp.program.competitions || []) || [];

      console.log("All workouts:", allWorkouts);
      console.log("All competitions:", allCompetitions);

      return {
        programs: sharedData?.map(sp => sp.program) || [],
        workouts: allWorkouts,
        competitions: allCompetitions,
      };
    },
    enabled: !!user?.id,
  });

  const todayWorkout = sharedPrograms?.workouts.find(workout => 
    workout.date && isSameDay(new Date(workout.date), today)
  );

  const upcomingCompetition = sharedPrograms?.competitions.find(competition =>
    competition.date && isWithinInterval(new Date(competition.date), {
      start: weekStart,
      end: weekEnd
    })
  );

  if (isLoadingShared) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <Card>
          <CardHeader>
            <CardTitle>Chargement...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  console.log("Today workout:", todayWorkout);
  console.log("Upcoming competition:", upcomingCompetition);
  console.log("Shared programs length:", sharedPrograms?.programs.length);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      <InvitationsList />

      {sharedPrograms?.programs.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {todayWorkout && (
              <Card className="h-full">
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
              <Card className="h-full">
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
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Calendrier des séances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProgramWorkoutCalendar
                workouts={sharedPrograms.workouts}
                competitions={sharedPrograms.competitions}
                programId={null}
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