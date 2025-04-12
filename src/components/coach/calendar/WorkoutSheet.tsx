
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
import { useEffect, useState, useCallback, useRef } from "react";
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
  const openChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Protéger contre les doubles appels
  const isOpenChangeProcessing = useRef(false);
  const lastOpenChangeTime = useRef(0);
  
  // Vérifier si la date est valide une seule fois
  const isValidDate = selectedDate instanceof Date && !isNaN(selectedDate.getTime());

  // Formater la date de manière sécurisée avec gestion des erreurs
  useEffect(() => {
    if (!selectedDate) {
      setFormattedDate("Date non sélectionnée");
      return;
    }

    try {
      // Vérifier que la date est valide avant le formatage
      if (!isValidDate) {
        console.error("Invalid date object in WorkoutSheet:", selectedDate);
        setFormattedDate("Date invalide");
        return;
      }
      
      const formatted = format(selectedDate, "EEEE d MMMM yyyy", { locale: fr });
      setFormattedDate(formatted);
    } catch (error) {
      console.error("Error formatting date in WorkoutSheet:", error, selectedDate);
      setFormattedDate("Erreur de formatage de date");
      
      // Fermer la feuille en cas d'erreur de date
      if (isOpen) {
        handleSafeOpenChange(false);
        toast.error("Erreur de formatage de date");
      }
    }
  }, [selectedDate, isOpen, isValidDate]);

  // Handler sécurisé avec protection contre les doubles clics
  const handleSafeOpenChange = useCallback((open: boolean) => {
    const now = Date.now();
    
    if (isOpenChangeProcessing.current || (now - lastOpenChangeTime.current < 800)) {
      console.log("Ignoring rapid openChange call:", open);
      return;
    }
    
    isOpenChangeProcessing.current = true;
    lastOpenChangeTime.current = now;
    
    // Annuler tout délai précédent
    if (openChangeTimeoutRef.current) {
      clearTimeout(openChangeTimeoutRef.current);
    }
    
    try {
      // Appeler onOpenChange avec un délai
      openChangeTimeoutRef.current = setTimeout(() => {
        try {
          onOpenChange(open);
        } catch (error) {
          console.error("Error in delayed onOpenChange:", error);
        } finally {
          // Réinitialiser le flag après un court délai
          setTimeout(() => {
            isOpenChangeProcessing.current = false;
          }, 500);
        }
      }, 50);
    } catch (error) {
      console.error("Error setting up delayed onOpenChange:", error);
      isOpenChangeProcessing.current = false;
    }
  }, [onOpenChange]);

  // Vérification de sécurité pour fermer la feuille si selectedDate devient undefined
  useEffect(() => {
    if (!selectedDate && isOpen) {
      console.log("Closing sheet because selectedDate is undefined");
      handleSafeOpenChange(false);
    }
  }, [selectedDate, isOpen, handleSafeOpenChange]);

  // Nettoyage à la déconnexion du composant
  useEffect(() => {
    return () => {
      if (isOpen) {
        try {
          console.log("Cleaning up WorkoutSheet");
          onOpenChange(false);
        } catch (error) {
          console.error("Error during WorkoutSheet cleanup:", error);
        }
      }
      
      if (openChangeTimeoutRef.current) {
        clearTimeout(openChangeTimeoutRef.current);
      }
      
      isOpenChangeProcessing.current = false;
    };
  }, [isOpen, onOpenChange]);

  // État local sécurisé pour les séances
  const safeWorkouts = Array.isArray(workouts) ? workouts : [];

  return (
    <Sheet 
      open={isOpen} 
      onOpenChange={handleSafeOpenChange}
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
