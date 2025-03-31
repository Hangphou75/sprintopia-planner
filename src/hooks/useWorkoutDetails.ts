
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useWorkoutDetails = (workoutId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);

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
            athlete:user_id (*)
          )
        `)
        .eq("id", workoutId)
        .single();

      if (error) {
        console.error("Error fetching workout:", error);
        throw error;
      }

      // Si nous avons besoin des athlètes partagés, faisons une requête séparée
      if (data && data.program && data.program.id) {
        const { data: sharedData, error: sharedError } = await supabase
          .from("shared_programs")
          .select(`
            athlete_id,
            athlete:athlete_id (*)
          `)
          .eq("program_id", data.program.id);

        if (!sharedError && sharedData) {
          // Ajouter les données partagées au résultat
          data.program.shared_programs = sharedData.map(item => ({
            athlete: item.athlete
          }));
        }
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

  return {
    workout,
    isLoading,
    error,
  };
};
