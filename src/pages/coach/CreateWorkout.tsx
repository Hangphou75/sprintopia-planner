import { useParams, useNavigate } from "react-router-dom";
import { WorkoutForm, WorkoutFormValues } from "@/components/workouts/WorkoutForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CreateWorkout = () => {
  const { programId } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (values: WorkoutFormValues) => {
    try {
      console.log("Creating workout with values:", values);
      
      const { data, error } = await supabase
        .from("workouts")
        .insert({
          program_id: programId,
          title: values.title,
          description: values.description,
          date: values.date.toISOString(),
          time: values.time,
          theme: values.theme,
          recovery: values.recovery,
          details: values.details,
          phase: values.phase,
          type: values.type,
          intensity: values.intensity,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating workout:", error);
        toast.error("Erreur lors de la création de la séance");
        return;
      }

      console.log("Workout created successfully:", data);
      toast.success("Séance créée avec succès");
      navigate(`/coach/programs/${programId}/workouts`);
    } catch (error) {
      console.error("Error creating workout:", error);
      toast.error("Erreur lors de la création de la séance");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Nouvelle séance</h1>
      <WorkoutForm onSubmit={handleSubmit} />
    </div>
  );
};