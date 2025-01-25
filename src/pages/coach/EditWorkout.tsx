import { useParams, useNavigate } from "react-router-dom";
import { WorkoutForm, WorkoutFormValues } from "@/components/workouts/WorkoutForm";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const EditWorkout = () => {
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
      return data;
    },
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
        })
        .eq("id", workoutId);

      if (error) throw error;

      toast.success("Séance mise à jour avec succès");
      navigate(`/coach/programs/${programId}/workouts`);
    } catch (error) {
      console.error("Error updating workout:", error);
      toast.error("Erreur lors de la mise à jour de la séance");
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!workout) {
    return <div>Séance non trouvée</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Modifier la séance</h1>
      <WorkoutForm
        onSubmit={handleSubmit}
        initialValues={{
          title: workout.title,
          description: workout.description || "",
          date: new Date(workout.date),
          time: workout.time || "09:00",
          theme: workout.theme || "",
          recovery: workout.recovery || "",
          details: workout.details || "",
        }}
      />
    </div>
  );
};