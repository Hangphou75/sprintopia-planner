
import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { startOfDay, parseISO, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { WorkoutSheet } from "./calendar/WorkoutSheet";
import { toast } from "sonner";

type CoachCalendarProps = {
  coachId: string | undefined;
};

export const CoachCalendar = ({ coachId }: CoachCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Référence pour suivre si une requête est en cours
  const isFetchingRef = useRef(false);
  
  // Éviter les clics multiples successifs
  const [isProcessingClick, setIsProcessingClick] = useState(false);
  // Suivi du dernier clic pour éviter les doubles clics
  const lastClickTime = useRef(0);

  const { data: workouts, isLoading: isLoadingWorkouts, error: workoutsError } = useQuery({
    queryKey: ["coach-workouts", coachId, selectedDate?.toISOString()],
    queryFn: async () => {
      if (!coachId || !selectedDate) return [];
      if (isFetchingRef.current) return [];

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
        isFetchingRef.current = false;
      }
    },
    enabled: !!coachId && !!selectedDate,
    retry: 1,
    staleTime: 30000, // 30 secondes
  });

  // Gestion des erreurs pour montrer des toasts
  useEffect(() => {
    if (workoutsError) {
      toast.error("Erreur lors du chargement des séances");
      console.error("Workout fetch error:", workoutsError);
    }
  }, [workoutsError]);

  const { data: allWorkouts, error: allWorkoutsError } = useQuery({
    queryKey: ["coach-all-workouts", coachId],
    queryFn: async () => {
      if (!coachId) return [];
      if (isFetchingRef.current) return [];

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
        isFetchingRef.current = false;
      }
    },
    enabled: !!coachId,
    retry: 1,
    staleTime: 30000, // 30 secondes
  });

  // Gestion des erreurs pour montrer des toasts
  useEffect(() => {
    if (allWorkoutsError) {
      toast.error("Erreur lors du chargement des données de calendrier");
      console.error("All workouts fetch error:", allWorkoutsError);
    }
  }, [allWorkoutsError]);

  // Sélection de date avec protection anti-double-clic
  const handleDateSelect = useCallback((date: Date | undefined) => {
    // Protection contre les clics trop rapides
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;
    
    if (isProcessingClick || timeSinceLastClick < 500) {
      console.log("Ignoring click, too soon or already processing");
      return;
    }
    
    lastClickTime.current = now;
    setIsProcessingClick(true);
    console.log("Selected date:", date);
    
    try {
      // Vérifier si la date est valide
      if (date && !isNaN(date.getTime())) {
        setSelectedDate(date);
        setIsDetailsOpen(true);
      } else {
        console.error("Invalid date selected:", date);
        setSelectedDate(new Date());
      }
    } catch (error) {
      console.error("Error in date selection:", error);
      // En cas d'erreur, revenir à aujourd'hui
      setSelectedDate(new Date());
    } finally {
      // Réinitialiser l'état de traitement après un court délai
      setTimeout(() => {
        setIsProcessingClick(false);
      }, 500);
    }
  }, [isProcessingClick]);

  const handleEditWorkout = useCallback((programId: string, workoutId: string) => {
    try {
      if (!programId || !workoutId) {
        console.error("Invalid programId or workoutId:", { programId, workoutId });
        return;
      }
      navigate(`/coach/programs/${programId}/workouts/${workoutId}/edit`);
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Erreur lors de la navigation");
    }
  }, [navigate]);

  const refreshData = useCallback(() => {
    try {
      queryClient.invalidateQueries({ queryKey: ["coach-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["coach-all-workouts"] });
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [queryClient]);

  // S'assurer que la feuille est fermée lors de la navigation
  useEffect(() => {
    return () => {
      setIsDetailsOpen(false);
    };
  }, []);

  // Si des erreurs se produisent, montrer un message d'erreur
  if (workoutsError && allWorkoutsError) {
    return (
      <div className="text-center p-4 text-red-500">
        Une erreur est survenue lors du chargement des données. Veuillez rafraîchir la page.
      </div>
    );
  }

  return (
    <div>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        className="rounded-md border"
        locale={fr}
        components={{
          DayContent: ({ date }) => {
            // Protection contre les dates non valides
            if (!date || isNaN(date.getTime())) {
              console.error("Invalid date in DayContent:", date);
              return <div>--</div>;
            }
            
            // Protection contre les entrées allWorkouts non valides
            const hasWorkouts = Array.isArray(allWorkouts) && allWorkouts.some(
              workout => {
                if (!workout?.date) return false;
                try {
                  const workoutDate = startOfDay(parseISO(workout.date));
                  const currentDate = startOfDay(date);
                  return workoutDate.getTime() === currentDate.getTime();
                } catch (error) {
                  console.error("Error comparing dates:", error);
                  return false;
                }
              }
            );

            return (
              <div className="relative w-full h-full">
                <div>{date.getDate()}</div>
                {hasWorkouts && (
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                  </div>
                )}
              </div>
            );
          },
        }}
      />

      <WorkoutSheet
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        selectedDate={selectedDate}
        workouts={workouts || []}
        isLoading={isLoadingWorkouts}
        onEditWorkout={handleEditWorkout}
        onWorkoutUpdated={refreshData}
      />
    </div>
  );
};
