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

type WorkoutSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | undefined;
  workouts: any[];
  isLoading: boolean;
  onEditWorkout: (programId: string, workoutId: string) => void;
};

export const WorkoutSheet = ({
  isOpen,
  onOpenChange,
  selectedDate,
  workouts,
  isLoading,
  onEditWorkout,
}: WorkoutSheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
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