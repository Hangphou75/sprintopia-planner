import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const themes = [
  { value: "aerobic", label: "Aérobie" },
  { value: "anaerobic-alactic", label: "Anaérobie Alactique" },
  { value: "anaerobic-lactic", label: "Anaérobie lactique" },
  { value: "strength", label: "Renforcement musculaire" },
  { value: "technical", label: "Travail technique" },
  { value: "mobility", label: "Mobilité" },
  { value: "plyometric", label: "Plyométrie" },
];

export const WorkoutDetails = () => {
  const { workoutId, programId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: workout, isLoading } = useQuery({
    queryKey: ["workout", workoutId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("id", workoutId)
        .maybeSingle();

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

  const themeLabel = themes.find(t => t.value === workout.theme)?.label || workout.theme;

  const handleEditClick = () => {
    if (user?.role === "individual_athlete") {
      navigate(`/individual-athlete/programs/${programId}/workouts/${workoutId}/edit`);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        
        {user?.role === "individual_athlete" && (
          <Button
            onClick={handleEditClick}
            className="flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            Modifier
          </Button>
        )}
      </div>

      <Card className={cn(
        "border-2",
        workout.theme && `border-theme-${workout.theme}`
      )}>
        <CardHeader>
          <CardTitle className="text-2xl">{workout.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Date et heure</h3>
                <p className="text-muted-foreground">
                  {format(new Date(workout.date), 'dd MMMM yyyy', { locale: fr })}
                  {workout.time && ` à ${workout.time}`}
                </p>
              </div>

              {workout.theme && (
                <div>
                  <h3 className="font-semibold mb-1">Type de séance</h3>
                  <p className="text-muted-foreground">{themeLabel}</p>
                </div>
              )}

              {workout.phase && (
                <div>
                  <h3 className="font-semibold mb-1">Phase</h3>
                  <p className="text-muted-foreground capitalize">{workout.phase}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {workout.intensity && (
                <div>
                  <h3 className="font-semibold mb-1">Intensité</h3>
                  <p className="text-muted-foreground">{workout.intensity}</p>
                </div>
              )}

              {workout.recovery && (
                <div>
                  <h3 className="font-semibold mb-1">Récupération</h3>
                  <p className="text-muted-foreground">{workout.recovery}</p>
                </div>
              )}

              {workout.duration && (
                <div>
                  <h3 className="font-semibold mb-1">Durée</h3>
                  <p className="text-muted-foreground">{workout.duration}</p>
                </div>
              )}
            </div>
          </div>

          {workout.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {workout.description}
              </p>
            </div>
          )}

          {workout.details && (
            <div>
              <h3 className="font-semibold mb-2">Détails de la séance</h3>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">
                  {typeof workout.details === 'string' 
                    ? workout.details 
                    : JSON.stringify(workout.details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};