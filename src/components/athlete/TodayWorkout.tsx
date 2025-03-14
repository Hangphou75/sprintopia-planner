
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getThemeLabel } from "@/utils/themeUtils";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";

type WorkoutProps = {
  workout: {
    id: string;
    title: string;
    date: string;
    time?: string;
    theme?: string;
    phase?: string;
    intensity?: string;
    recovery?: string;
    duration?: string;
    description?: string;
    details?: any;
  };
  programId: string;
};

export const TodayWorkout = ({ workout, programId }: WorkoutProps) => {
  const navigate = useNavigate();

  const handleWorkoutClick = () => {
    navigate(`/athlete/programs/${programId}/workouts/${workout.id}`);
  };
  
  const handleFeedbackClick = () => {
    navigate(`/athlete/programs/${programId}/workouts/${workout.id}?feedback=true`);
  };

  const formatDescription = (description: string) => {
    return description.split(',').map(item => item.trim()).join('\n- ');
  };

  return (
    <Card className={cn(
      "h-full border-2",
      workout.theme && `border-theme-${workout.theme}`
    )}>
      <CardHeader>
        <CardTitle className="text-2xl">
          {workout.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Date et heure</h3>
              <p className="text-muted-foreground">
                {format(parseISO(workout.date), 'd MMMM yyyy', { locale: fr })}
                {workout.time && ` à ${workout.time}`}
              </p>
            </div>

            {workout.theme && (
              <div>
                <h3 className="font-semibold mb-1">Type de séance</h3>
                <p className="text-muted-foreground">
                  {getThemeLabel(workout.theme)}
                </p>
              </div>
            )}

            {workout.phase && (
              <div>
                <h3 className="font-semibold mb-1">Phase</h3>
                <p className="text-muted-foreground capitalize">
                  {workout.phase}
                </p>
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
              - {formatDescription(workout.description)}
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

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleWorkoutClick}
          >
            Voir les détails
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleFeedbackClick}
          >
            <MessageSquare className="h-4 w-4" />
            Feedback
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
