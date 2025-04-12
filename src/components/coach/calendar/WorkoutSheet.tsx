
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { WorkoutDetails } from "./WorkoutDetails";
import { useEffect } from "react";

type WorkoutSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | undefined;
  workouts: any[];
  isLoading: boolean;
  onEditWorkout: (programId: string, workoutId: string) => void;
  onWorkoutUpdated?: () => void;
};

export const WorkoutSheet = ({
  isOpen,
  onOpenChange,
  selectedDate,
  workouts,
  isLoading,
  onEditWorkout,
  onWorkoutUpdated,
}: WorkoutSheetProps) => {
  // Safety check to close the sheet if selectedDate becomes undefined
  useEffect(() => {
    if (!selectedDate && isOpen) {
      console.log("Closing sheet because selectedDate is undefined");
      onOpenChange(false);
    }
  }, [selectedDate, isOpen, onOpenChange]);

  // Format date safely with error handling
  const formattedDate = selectedDate 
    ? (() => {
        try {
          return format(selectedDate, "EEEE d MMMM yyyy", { locale: fr });
        } catch (error) {
          console.error("Error formatting date:", error);
          return "Date invalide";
        }
      })() 
    : "Date non sélectionnée";

  return (
    <Sheet 
      open={isOpen} 
      onOpenChange={(open) => {
        try {
          onOpenChange(open);
        } catch (error) {
          console.error("Error in onOpenChange handler:", error);
          // Force close if we encounter an error
          onOpenChange(false);
        }
      }}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {formattedDate}
          </SheetTitle>
          <SheetDescription>
            Séances prévues pour vos athlètes
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <p>Chargement des séances...</p>
          ) : workouts && workouts.length > 0 ? (
            workouts.map((workout) => (
              <WorkoutDetails
                key={workout.id}
                workout={workout}
                onEditWorkout={onEditWorkout}
                onWorkoutUpdated={onWorkoutUpdated}
              />
            ))
          ) : (
            <p className="text-muted-foreground">Aucune séance prévue ce jour</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
