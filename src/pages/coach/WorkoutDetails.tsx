
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { WorkoutDetails as WorkoutDetailsComponent } from "@/components/coach/calendar/WorkoutDetails";
import { WorkoutHeader } from "@/components/workouts/WorkoutHeader";
import { WorkoutInfoCard } from "@/components/workouts/WorkoutInfoCard";
import { WorkoutDetailsContent } from "@/components/workouts/WorkoutDetailsContent";
import { WorkoutRecovery } from "@/components/workouts/WorkoutRecovery";
import { WorkoutLoader } from "@/components/workouts/WorkoutLoader";
import { WorkoutError } from "@/components/workouts/WorkoutError";
import { useWorkoutDetails } from "@/hooks/useWorkoutDetails";

export const WorkoutDetails = () => {
  const { programId, workoutId } = useParams();
  const navigate = useNavigate();

  console.log("WorkoutDetails component - Params:", { programId, workoutId });

  const { workout, isLoading, error } = useWorkoutDetails(workoutId);

  const handleEditWorkout = (programId: string, workoutId: string) => {
    console.log(`Navigating to edit workout: /coach/programs/${programId}/workouts/${workoutId}/edit`);
    navigate(`/coach/programs/${programId}/workouts/${workoutId}/edit`);
  };

  const handleBack = () => navigate(-1);

  if (error) {
    toast.error("Erreur lors du chargement de la séance");
    return (
      <WorkoutError 
        onBack={handleBack}
        title="Erreur"
        message="Une erreur est survenue lors du chargement de la séance."
      />
    );
  }

  if (isLoading) {
    return (
      <WorkoutLoader 
        onBack={handleBack}
        title="Chargement..."
      />
    );
  }

  if (!workout) {
    return (
      <WorkoutError 
        onBack={handleBack}
        title="Séance introuvable"
        message="La séance que vous recherchez n'existe pas ou a été supprimée."
      />
    );
  }

  return (
    <div className="container mx-auto p-6">
      <WorkoutHeader 
        title="Détails de la séance"
        onBack={handleBack}
        onEdit={() => handleEditWorkout(workout.program?.id, workout.id)}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <WorkoutInfoCard
            title={workout.title}
            date={workout.date}
            time={workout.time}
            theme={workout.theme}
            description={workout.description}
          />

          {workout.details && (
            <WorkoutDetailsContent details={workout.details} />
          )}
        </div>

        <div>
          <WorkoutDetailsComponent
            workout={workout}
            onEditWorkout={() => handleEditWorkout(workout.program?.id, workout.id)}
          />
          
          <WorkoutRecovery recovery={workout.recovery} />
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetails;
