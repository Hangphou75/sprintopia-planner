import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ProgramWorkouts = () => {
  const { programId } = useParams();
  const navigate = useNavigate();

  const { data: workouts, isLoading } = useQuery({
    queryKey: ["workouts", programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("program_id", programId)
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Séances d'entraînement</h1>
        <Button onClick={() => navigate(`/coach/programs/${programId}/workouts/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle séance
        </Button>
      </div>

      <div className="grid gap-4">
        {workouts?.map((workout) => (
          <div
            key={workout.id}
            className="p-4 border rounded-lg hover:border-primary transition-colors"
            onClick={() => navigate(`/coach/programs/${programId}/workouts/${workout.id}/edit`)}
          >
            <h3 className="font-semibold">{workout.title}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(workout.date).toLocaleDateString()} à {workout.time}
            </p>
            <p className="text-sm">{workout.theme}</p>
          </div>
        ))}
      </div>
    </div>
  );
};