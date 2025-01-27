import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvitationsList } from "@/components/athlete/InvitationsList";
import { format, startOfWeek, endOfWeek, isWithinInterval, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Trophy, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgramWorkoutCalendar } from "@/components/programs/ProgramWorkoutCalendar";

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

  const getThemeLabel = (theme: string) => {
    const themeMap: { [key: string]: string } = {
      "aerobic": "Aérobie",
      "anaerobic-lactic": "Anaérobie lactique",
      "anaerobic-alactic": "Anaérobie alactique",
      "mobility": "Mobilité",
      "conditioning": "Préparation physique",
      "power": "Force",
      "competition": "Compétition",
      "recovery": "Récupération",
      "technique": "Technique",
      "speed": "Vitesse",
      "endurance": "Endurance",
      "alactic": "Anaérobie alactique",
      "lactic": "Anaérobie lactique"
    };
    return themeMap[theme] || theme;
  };

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
                          {getThemeLabel(todayWorkout.theme)}
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
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">{upcomingCompetition.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(upcomingCompetition.date), "d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{upcomingCompetition.distance}m • {
                        upcomingCompetition.level === "local" ? "Local" :
                        upcomingCompetition.level === "regional" ? "Régional" :
                        upcomingCompetition.level === "national" ? "National" :
                        "International"
                      }</p>
                      {upcomingCompetition.location && (
                        <p className="mt-1">Lieu : {upcomingCompetition.location}</p>
                      )}
                      {upcomingCompetition.time && (
                        <p className="mt-1">Heure : {upcomingCompetition.time}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
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