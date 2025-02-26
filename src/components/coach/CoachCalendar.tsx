
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

  const { data: workouts, isLoading: isLoadingWorkouts } = useQuery({
    queryKey: ["coach-workouts", coachId, selectedDate],
    queryFn: async () => {
      if (!coachId || !selectedDate) return [];

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

      // On ne récupère plus les séances directes du coach
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
    },
    enabled: !!coachId && !!selectedDate,
  });

  const { data: allWorkouts } = useQuery({
    queryKey: ["coach-all-workouts", coachId],
    queryFn: async () => {
      if (!coachId) return [];

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
    },
    enabled: !!coachId,
  });

  const handleDateSelect = (date: Date | undefined) => {
    console.log("Selected date:", date);
    setSelectedDate(date);
    if (date) {
      setIsDetailsOpen(true);
    }
  };

  const handleEditWorkout = (programId: string, workoutId: string) => {
    navigate(`/coach/programs/${programId}/workouts/${workoutId}/edit`);
  };

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
                const workoutDate = startOfDay(parseISO(workout.date));
                const currentDate = startOfDay(date);
                return workoutDate.getTime() === currentDate.getTime();
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
      />
    </div>
  );
};
