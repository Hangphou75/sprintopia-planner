
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define proper types for our data structure
interface Athlete {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  [key: string]: any; // For other potential properties in the athlete object
}

interface SharedAthlete {
  athlete: Athlete;
}

interface Program {
  id: string;
  name: string;
  athlete: Athlete;
  shared_programs?: SharedAthlete[];
}

interface Workout {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  theme: string | null;
  details: any;
  recovery: string | null;
  program: Program;
  [key: string]: any; // For other properties in the workout
}

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

      // If we need shared athletes, make a separate request
      if (data && data.program && data.program.id) {
        const { data: sharedData, error: sharedError } = await supabase
          .from("shared_programs")
          .select(`
            athlete_id,
            athlete:athlete_id (*)
          `)
          .eq("program_id", data.program.id);

        if (!sharedError && sharedData) {
          // Add shared data to the result with proper type casting
          (data.program as Program).shared_programs = sharedData.map(item => ({
            athlete: item.athlete as Athlete
          }));
        }
      }

      console.log("Workout details fetched:", data);
      return data as Workout;
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
