
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvitationsList } from "@/components/athlete/InvitationsList";
import { startOfWeek, endOfWeek, isWithinInterval, isSameDay } from "date-fns";
import { ProgramWorkoutCalendar } from "@/components/programs/ProgramWorkoutCalendar";
import { TodayWorkout } from "@/components/athlete/TodayWorkout";
import { UpcomingCompetition } from "@/components/athlete/UpcomingCompetition";

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
          program:program_id (
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
              intensity,
              recovery,
              duration,
              phase
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

      const allWorkouts = sharedData?.reduce((acc, sp) => {
        return acc.concat(sp.program?.workouts || []);
      }, []) || [];
      
      const allCompetitions = sharedData?.reduce((acc, sp) => {
        return acc.concat(sp.program?.competitions || []);
      }, []) || [];

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      <InvitationsList />

      {sharedPrograms?.programs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {todayWorkout && (
              <TodayWorkout 
                workout={todayWorkout}
                programId={sharedPrograms.programs[0]?.id}
              />
            )}

            {upcomingCompetition && (
              <UpcomingCompetition 
                competition={upcomingCompetition}
              />
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Calendrier</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ProgramWorkoutCalendar
                workouts={sharedPrograms.workouts}
                competitions={sharedPrograms.competitions}
                programId={sharedPrograms.programs[0]?.id}
              />
            </CardContent>
          </Card>
        </>
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
