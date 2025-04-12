
import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { startOfDay, parseISO, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { WorkoutSheet } from "./calendar/WorkoutSheet";

type CoachCalendarProps = {
  coachId: string | undefined;
};

export const CoachCalendar = ({ coachId }: CoachCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Avoid multiple successive click handling
  const [isProcessingClick, setIsProcessingClick] = useState(false);

  const { data: workouts, isLoading: isLoadingWorkouts } = useQuery({
    queryKey: ["coach-workouts", coachId, selectedDate?.toISOString()],
    queryFn: async () => {
      if (!coachId || !selectedDate) return [];

      try {
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
      }
    },
    enabled: !!coachId && !!selectedDate,
  });

  const { data: allWorkouts } = useQuery({
    queryKey: ["coach-all-workouts", coachId],
    queryFn: async () => {
      if (!coachId) return [];

      try {
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
      }
    },
    enabled: !!coachId,
  });

  // Separate date selection logic into a callback that includes debounce
  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (isProcessingClick) return;
    
    setIsProcessingClick(true);
    console.log("Selected date:", date);
    
    setSelectedDate(date);
    if (date) {
      setIsDetailsOpen(true);
    }
    
    // Reset processing flag after a short delay
    setTimeout(() => {
      setIsProcessingClick(false);
    }, 300);
  }, [isProcessingClick]);

  const handleEditWorkout = useCallback((programId: string, workoutId: string) => {
    navigate(`/coach/programs/${programId}/workouts/${workoutId}/edit`);
  }, [navigate]);

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["coach-workouts"] });
    queryClient.invalidateQueries({ queryKey: ["coach-all-workouts"] });
  }, [queryClient]);

  // Ensure sheet is closed when navigating away
  useEffect(() => {
    return () => {
      setIsDetailsOpen(false);
    };
  }, []);

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
            const hasWorkouts = allWorkouts?.some(
              workout => {
                if (!workout.date) return false;
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
