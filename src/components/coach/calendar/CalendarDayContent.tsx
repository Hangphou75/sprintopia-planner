
import { parseISO, startOfDay } from "date-fns";

type CalendarDayContentProps = {
  date: Date | null | undefined;
  allWorkouts: any[] | undefined;
};

export const CalendarDayContent = ({ date, allWorkouts }: CalendarDayContentProps) => {
  // Protection contre les dates non valides
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return <div className="text-muted-foreground">--</div>;
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
};
