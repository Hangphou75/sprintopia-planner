
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type WorkoutDetailsProps = {
  workout: any;
  onEditWorkout: (programId: string, workoutId: string) => void;
};

export const WorkoutDetails = ({ workout, onEditWorkout }: WorkoutDetailsProps) => {
  const getAthletes = (workout: any) => {
    const athletes = [];
    
    if (workout.program?.athlete) {
      athletes.push(workout.program.athlete);
    }
    
    if (workout.program?.shared_programs) {
      workout.program.shared_programs.forEach((sp: any) => {
        if (sp.athlete) {
          athletes.push(sp.athlete);
        }
      });
    }
    
    return athletes;
  };

  const handleEditClick = () => {
    console.log("Edit workout clicked:", workout);
    console.log("Program ID:", workout.program?.id);
    console.log("Workout ID:", workout.id);
    onEditWorkout(workout.program?.id, workout.id);
  };

  return (
    <Card key={workout.id} className="border-l-4 border-primary">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {workout.title}
            {workout.theme && (
              <Badge variant="outline" className={cn("border-theme-" + workout.theme)}>
                {workout.theme}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEditClick}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm font-medium">Athlètes :</div>
          {getAthletes(workout).map((athlete: any) => (
            <div key={athlete.id} className="text-sm text-muted-foreground">
              {athlete.first_name} {athlete.last_name}
            </div>
          ))}
          {workout.description && (
            <p className="text-sm text-muted-foreground mt-2">{workout.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
