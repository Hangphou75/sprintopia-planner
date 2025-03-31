
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Calendar, Clock, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WorkoutDetails as WorkoutDetailsComponent } from "@/components/coach/calendar/WorkoutDetails";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

export const WorkoutDetails = () => {
  const { programId, workoutId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  console.log("WorkoutDetails component - Params:", { programId, workoutId });

  const { data: workout, isLoading: isLoadingWorkout, error } = useQuery({
    queryKey: ["workout", workoutId],
    queryFn: async () => {
      console.log("Fetching workout details for:", workoutId);
      const { data, error } = await supabase
        .from("workouts")
        .select(`
          *,
          program:program_id (
            id,
            name,
            athlete:user_id (*),
            shared_programs (
              athlete:user_id (*)
            )
          )
        `)
        .eq("id", workoutId)
        .single();

      if (error) {
        console.error("Error fetching workout:", error);
        throw error;
      }

      console.log("Workout details fetched:", data);
      return data;
    },
    enabled: !!workoutId,
  });

  useEffect(() => {
    if (!isLoadingWorkout) {
      setIsLoading(false);
    }
  }, [isLoadingWorkout]);

  const handleEditWorkout = (programId: string, workoutId: string) => {
    console.log(`Navigating to edit workout: /coach/programs/${programId}/workouts/${workoutId}/edit`);
    navigate(`/coach/programs/${programId}/workouts/${workoutId}/edit`);
  };

  if (error) {
    toast.error("Erreur lors du chargement de la séance");
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Erreur</h1>
        </div>
        <p className="text-destructive">
          Une erreur est survenue lors du chargement de la séance.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Chargement...</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Séance introuvable</h1>
        </div>
        <p>La séance que vous recherchez n'existe pas ou a été supprimée.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Détails de la séance</h1>
        </div>
        <Button
          onClick={() => handleEditWorkout(workout.program?.id, workout.id)}
          size="sm"
        >
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{workout.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>
                  {format(new Date(workout.date), "EEEE dd MMMM yyyy", {
                    locale: fr,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>{workout.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-muted-foreground" />
                <span>
                  {workout.theme && (
                    <Badge variant="outline">{workout.theme}</Badge>
                  )}
                </span>
              </div>
              {workout.description && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {workout.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {workout.details && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Détails de la séance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm">
                  {workout.details}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <WorkoutDetailsComponent
            workout={workout}
            onEditWorkout={() => handleEditWorkout(workout.program?.id, workout.id)}
          />
          
          {workout.recovery && (
            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Récupération</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{workout.recovery}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetails;
