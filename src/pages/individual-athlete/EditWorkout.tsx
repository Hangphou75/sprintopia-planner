import { useParams, useNavigate } from "react-router-dom";
import { WorkoutForm, WorkoutFormValues } from "@/components/workouts/WorkoutForm";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Workout } from "@/types/database";

export const IndividualEditWorkout = () => {
  const { programId, workoutId } = useParams();
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
      return data as Workout;
    },
    enabled: !!workoutId,
  });

  const handleSubmit = async (values: WorkoutFormValues) => {
    try {
      const { error } = await supabase
        .from("workouts")
        .update({
          title: values.title,
          description: values.description,
          date: values.date.toISOString(),
          time: values.time,
          theme: values.theme,
          recovery: values.recovery,
          details: values.details,
          phase: values.phase || null,
          type: values.type || null,
          intensity: values.intensity || null,
        })
        .eq("id", workoutId);

      if (error) {
        console.error("Error updating workout:", error);
        toast.error("Erreur lors de la mise à jour de la séance");
        return;
      }

      toast.success("Séance mise à jour avec succès");
      navigate(`/individual-athlete/programs/${programId}/workouts`);
    } catch (error) {
      console.error("Error updating workout:", error);
      toast.error("Erreur lors de la mise à jour de la séance");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Chargement de la séance...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Séance introuvable</p>
      </div>
    );
  }

  const initialValues: WorkoutFormValues = {
    title: workout.title,
    description: workout.description || "",
    date: new Date(workout.date || new Date()),
    time: workout.time || "09:00",
    theme: workout.theme || "",
    recovery: workout.recovery || "",
    details: workout.details || "",
    phase: workout.phase || undefined,
    type: workout.type || undefined,
    intensity: workout.intensity || undefined,
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Modifier la séance</h1>
      <WorkoutForm onSubmit={handleSubmit} initialValues={initialValues} />
    </div>
  );
};