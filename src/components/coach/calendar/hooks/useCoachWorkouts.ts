
import { useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, startOfDay } from "date-fns";
import { toast } from "sonner";

export const useCoachWorkouts = (coachId: string | undefined, selectedDate: Date | undefined) => {
  // Référence pour suivre si une requête est en cours
  const isFetchingRef = useRef(false);

  // Nettoyage à la déconnexion du composant
  useEffect(() => {
    return () => {
      isFetchingRef.current = false;
    };
  }, []);

  const { data: workouts, isLoading: isLoadingWorkouts, error: workoutsError } = useQuery({
    queryKey: ["coach-workouts", coachId, selectedDate?.toISOString()],
    queryFn: async () => {
      if (!coachId || !selectedDate) return [];
      if (isFetchingRef.current) {
        console.log("Already fetching workouts, skipping");
        return [];
      }

      try {
        isFetchingRef.current = true;
        
        const startDate = startOfDay(selectedDate);
        const endDate = addDays(startDate, 1);
        
        const formattedStartDate = startDate.toISOString();
        const formattedEndDate = endDate.toISOString();
        
        console.log("Fetching workouts between:", formattedStartDate, "and", formattedEndDate);

        const { data: coachAthletes, error: athletesError } = await supabase
          .from("coach_athletes")
          .select("athlete_id")
          .eq("coach_id", coachId);

        if (athletesError) {
          console.error("Error fetching athletes:", athletesError);
          return [];
        }

        if (!coachAthletes?.length) return [];

        const athleteIds = coachAthletes.map(row => row.athlete_id);

        const { data: sharedPrograms, error: sharedError } = await supabase
          .from("shared_programs")
          .select("program_id")
          .in("athlete_id", athleteIds);

        if (sharedError) {
          console.error("Error fetching shared programs:", sharedError);
          return [];
        }

        if (!sharedPrograms?.length) {
          return [];
        }

        const programIds = [...new Set(sharedPrograms.map(sp => sp.program_id))];

        const { data: sharedWorkouts, error: workoutsError } = await supabase
          .from("workouts")
          .select(`
            *,
            program:programs (
              id,
              name,
              user_id,
              athlete:profiles!programs_user_id_fkey (
                id,
                first_name,
                last_name
              ),
              shared_programs (
                athlete:profiles!shared_programs_athlete_id_fkey (
                  id,
                  first_name,
                  last_name
                )
              )
            )
          `)
          .in("program_id", programIds)
          .gte('date', formattedStartDate)
          .lt('date', formattedEndDate);

        if (workoutsError) {
          console.error("Error fetching workouts from shared programs:", workoutsError);
          return [];
        }

        return sharedWorkouts || [];
      } catch (error) {
        console.error("Error in workout query:", error);
        return [];
      } finally {
        // Délai avant de réinitialiser pour éviter les requêtes en rafale
        setTimeout(() => {
          isFetchingRef.current = false;
        }, 500);
      }
    },
    enabled: !!coachId && !!selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime()),
    retry: 1,
    staleTime: 30000, // 30 secondes
  });

  return {
    workouts,
    isLoadingWorkouts,
    workoutsError
  };
};
