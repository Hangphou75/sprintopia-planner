
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
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [formattedDate, setFormattedDate] = useState<string>("Date non sélectionnée");

  // Formater la date de manière sécurisée avec gestion des erreurs
  useEffect(() => {
    if (!selectedDate) {
      setFormattedDate("Date non sélectionnée");
      return;
    }

    try {
      // Vérifier que la date est valide avant le formatage
      if (!(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
        console.error("Invalid date object:", selectedDate);
        setFormattedDate("Date invalide");
        return;
      }
      
      const formatted = format(selectedDate, "EEEE d MMMM yyyy", { locale: fr });
      setFormattedDate(formatted);
    } catch (error) {
      console.error("Error formatting date:", error, selectedDate);
      setFormattedDate("Erreur de formatage de date");
      
      // Fermer la feuille en cas d'erreur de date
      if (isOpen) {
        setTimeout(() => onOpenChange(false), 100);
        toast.error("Erreur de formatage de date");
      }
    }
  }, [selectedDate, isOpen, onOpenChange]);

  // Vérification de sécurité pour fermer la feuille si selectedDate devient undefined
  useEffect(() => {
    if (!selectedDate && isOpen) {
      console.log("Closing sheet because selectedDate is undefined");
      setTimeout(() => onOpenChange(false), 100);
    }
  }, [selectedDate, isOpen, onOpenChange]);

  // Nettoyage à la déconnexion du composant
  useEffect(() => {
    return () => {
      if (isOpen) {
        onOpenChange(false);
      }
    };
  }, []);

  // État local sécurisé pour les séances
  const safeWorkouts = Array.isArray(workouts) ? workouts : [];

  return (
    <Sheet 
      open={isOpen} 
      onOpenChange={(open) => {
        try {
          onOpenChange(open);
        } catch (error) {
          console.error("Error in onOpenChange handler:", error);
          // Forcer la fermeture en cas d'erreur
          onOpenChange(false);
          toast.error("Une erreur est survenue");
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
          ) : safeWorkouts.length > 0 ? (
            safeWorkouts.map((workout) => (
              <WorkoutDetails
                key={workout.id || Math.random().toString()}
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
