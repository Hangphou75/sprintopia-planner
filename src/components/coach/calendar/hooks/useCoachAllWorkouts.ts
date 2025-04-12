
import { useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCoachAllWorkouts = (coachId: string | undefined) => {
  // Référence pour suivre si une requête est en cours
  const isFetchingRef = useRef(false);

  // Nettoyage à la déconnexion du composant
  useEffect(() => {
    return () => {
      isFetchingRef.current = false;
    };
  }, []);

  const { data: allWorkouts, error: allWorkoutsError } = useQuery({
    queryKey: ["coach-all-workouts", coachId],
    queryFn: async () => {
      if (!coachId) return [];
      if (isFetchingRef.current) {
        console.log("Already fetching all workouts, skipping");
        return [];
      }

      try {
        isFetchingRef.current = true;
        
        const { data: coachAthletes } = await supabase
          .from("coach_athletes")
          .select("athlete_id")
          .eq("coach_id", coachId);

        if (!coachAthletes?.length) return [];

        const athleteIds = coachAthletes.map(row => row.athlete_id);

        const { data: sharedPrograms } = await supabase
          .from("shared_programs")
          .select("program_id")
          .in("athlete_id", athleteIds);

        if (!sharedPrograms?.length) {
          return [];
        }

        const programIds = [...new Set(sharedPrograms.map(sp => sp.program_id))];

        const { data: sharedWorkouts } = await supabase
          .from("workouts")
          .select(`
            date,
            program:programs (
              user_id
            )
          `)
          .in("program_id", programIds);

        return sharedWorkouts || [];
      } catch (error) {
        console.error("Error in allWorkouts query:", error);
        return [];
      } finally {
        // Délai avant de réinitialiser pour éviter les requêtes en rafale
        setTimeout(() => {
          isFetchingRef.current = false;
        }, 500);
      }
    },
    enabled: !!coachId,
    retry: 1,
    staleTime: 30000, // 30 secondes
  });

  return {
    allWorkouts,
    allWorkoutsError
  };
};
