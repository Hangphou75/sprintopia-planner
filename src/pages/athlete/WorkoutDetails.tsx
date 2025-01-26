import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Timer } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const WorkoutDetails = () => {
  const { workoutId } = useParams();
  const navigate = useNavigate();

  const { data: workout, isLoading } = useQuery({
    queryKey: ["workout", workoutId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("id", workoutId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">
          Séance non trouvée
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            {workout.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Date : {format(new Date(workout.date), 'dd MMMM yyyy', { locale: fr })}
            </p>
            {workout.time && (
              <p className="text-sm text-muted-foreground">
                Heure : {workout.time}
              </p>
            )}
          </div>

          {workout.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm">{workout.description}</p>
            </div>
          )}

          {workout.theme && (
            <div>
              <h3 className="font-semibold mb-2">Type de séance</h3>
              <p className="text-sm">{workout.theme}</p>
            </div>
          )}

          {workout.details && (
            <div>
              <h3 className="font-semibold mb-2">Détails</h3>
              <p className="text-sm whitespace-pre-wrap">
                {typeof workout.details === 'string' 
                  ? workout.details 
                  : JSON.stringify(workout.details, null, 2)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};