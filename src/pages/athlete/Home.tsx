import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvitationsList } from "@/components/athlete/InvitationsList";
import { format, startOfWeek, endOfWeek, isWithinInterval, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Trophy, Timer, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgramWorkoutCalendar } from "@/components/programs/ProgramWorkoutCalendar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const getThemeLabel = (theme: string) => {
    const themeMap: { [key: string]: string } = {
      "aerobic": "Aérobie",
      "anaerobic-lactic": "Anaérobie lactique",
      "anaerobic-alactic": "Anaérobie alactique",
      "mobility": "Mobilité",
      "conditioning": "Préparation physique",
      "strength": "Force",
      "power": "Puissance",
      "competition": "Compétition",
      "recovery": "Récupération",
      "technical": "Technique",
      "speed": "Vitesse",
      "endurance": "Endurance",
      "alactic": "Anaérobie alactique",
      "lactic": "Anaérobie lactique"
    };
    return themeMap[theme] || theme;
  };

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

  const handleWorkoutClick = (workoutId: string, programId: string) => {
    navigate(`/athlete/programs/${programId}/workouts/${workoutId}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      <InvitationsList />

      {sharedPrograms?.programs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {todayWorkout && (
              <Card className={cn(
                "h-full border-2",
                todayWorkout.theme && `border-theme-${todayWorkout.theme}`
              )}>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {todayWorkout.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-1">Date et heure</h3>
                        <p className="text-muted-foreground">
                          {format(parseISO(todayWorkout.date), 'd MMMM yyyy', { locale: fr })}
                          {todayWorkout.time && ` à ${todayWorkout.time}`}
                        </p>
                      </div>

                      {todayWorkout.theme && (
                        <div>
                          <h3 className="font-semibold mb-1">Type de séance</h3>
                          <p className="text-muted-foreground">
                            {getThemeLabel(todayWorkout.theme)}
                          </p>
                        </div>
                      )}

                      {todayWorkout.phase && (
                        <div>
                          <h3 className="font-semibold mb-1">Phase</h3>
                          <p className="text-muted-foreground capitalize">
                            {todayWorkout.phase}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {todayWorkout.intensity && (
                        <div>
                          <h3 className="font-semibold mb-1">Intensité</h3>
                          <p className="text-muted-foreground">{todayWorkout.intensity}</p>
                        </div>
                      )}

                      {todayWorkout.recovery && (
                        <div>
                          <h3 className="font-semibold mb-1">Récupération</h3>
                          <p className="text-muted-foreground">{todayWorkout.recovery}</p>
                        </div>
                      )}

                      {todayWorkout.duration && (
                        <div>
                          <h3 className="font-semibold mb-1">Durée</h3>
                          <p className="text-muted-foreground">{todayWorkout.duration}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {todayWorkout.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {todayWorkout.description}
                      </p>
                    </div>
                  )}

                  {todayWorkout.details && (
                    <div>
                      <h3 className="font-semibold mb-2">Détails de la séance</h3>
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap">
                          {typeof todayWorkout.details === 'string' 
                            ? todayWorkout.details 
                            : JSON.stringify(todayWorkout.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleWorkoutClick(todayWorkout.id, sharedPrograms.programs[0]?.id)}
                  >
                    Voir les détails
                  </Button>
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