
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import { WorkoutSheet } from "./calendar/WorkoutSheet";
import { toast } from "sonner";
import { fr } from "date-fns/locale";
import { useCoachWorkouts } from "./calendar/hooks/useCoachWorkouts";
import { useCoachAllWorkouts } from "./calendar/hooks/useCoachAllWorkouts";
import { useCalendarDateSelection } from "./calendar/hooks/useCalendarDateSelection";
import { CalendarDayContent } from "./calendar/CalendarDayContent";

type CoachCalendarProps = {
  coachId: string | undefined;
};

export const CoachCalendar = ({ coachId }: CoachCalendarProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const {
    selectedDate,
    isDetailsOpen,
    isProcessingClick,
    handleDateSelect,
    handleSheetOpenChange
  } = useCalendarDateSelection();

  const { 
    workouts, 
    isLoadingWorkouts, 
    workoutsError 
  } = useCoachWorkouts(coachId, selectedDate);
  
  const { 
    allWorkouts, 
    allWorkoutsError 
  } = useCoachAllWorkouts(coachId);

  // Gestion des erreurs pour montrer des toasts
  useEffect(() => {
    if (workoutsError) {
      toast.error("Erreur lors du chargement des séances");
      console.error("Workout fetch error:", workoutsError);
    }
  }, [workoutsError]);

  // Gestion des erreurs pour montrer des toasts
  useEffect(() => {
    if (allWorkoutsError) {
      toast.error("Erreur lors du chargement des données de calendrier");
      console.error("All workouts fetch error:", allWorkoutsError);
    }
  }, [allWorkoutsError]);

  const handleEditWorkout = (programId: string, workoutId: string) => {
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
  };

  const refreshData = () => {
    try {
      queryClient.invalidateQueries({ queryKey: ["coach-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["coach-all-workouts"] });
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // S'assurer que la feuille est fermée lors de la navigation
  useEffect(() => {
    return () => {
      handleSheetOpenChange(false);
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

  // Validation supplémentaire du selectedDate
  const validSelectedDate = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
    ? selectedDate
    : undefined;

  return (
    <div>
      <Calendar
        mode="single"
        selected={validSelectedDate}
        onSelect={handleDateSelect}
        className="rounded-md border"
        locale={fr}
        components={{
          DayContent: ({ date }) => (
            <CalendarDayContent 
              date={date} 
              allWorkouts={allWorkouts} 
            />
          ),
        }}
      />

      <WorkoutSheet
        isOpen={isDetailsOpen}
        onOpenChange={handleSheetOpenChange}
        selectedDate={validSelectedDate}
        workouts={workouts || []}
        isLoading={isLoadingWorkouts}
        onEditWorkout={handleEditWorkout}
        onWorkoutUpdated={refreshData}
      />
    </div>
  );
};
