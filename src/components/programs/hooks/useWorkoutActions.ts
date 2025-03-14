
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Event } from "../types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { InsertWorkout } from "@/types/database";

type UseWorkoutActionsProps = {
  programId: string;
  userRole?: string;
  onSuccess?: () => void;
};

export const useWorkoutActions = ({ programId, userRole, onSuccess }: UseWorkoutActionsProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleDuplicateWorkout = async (event: Event) => {
    // Allow both coaches and individual athletes to duplicate workouts
    if (event.type !== "workout" || (userRole !== 'coach' && userRole !== 'individual_athlete')) return;
    
    try {
      console.log("Attempting to duplicate workout:", event);
      
      // Create a new workout object with the correct property names
      const workoutData: Partial<InsertWorkout> = {
        program_id: programId,
        title: `${event.title} (copie)`,
        description: event.description,
        date: event.date.toISOString(),
        time: event.time,
        theme: event.theme,
        details: event.details,
        recovery: event.recovery,
        phase: event.phase,
        type: event.type,
        intensity: event.intensity,
      };
      
      const { data, error } = await supabase
        .from("workouts")
        .insert(workoutData)
        .select()
        .single();

      if (error) {
        console.error("Error duplicating workout:", error);
        throw error;
      }

      console.log("Workout duplicated successfully:", data);
      await queryClient.invalidateQueries({ queryKey: ["workouts", programId] });

      toast("Séance dupliquée avec succès");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error duplicating workout:", error);
      toast("Une erreur est survenue lors de la duplication de la séance");
    }
  };

  const handleDeleteWorkout = async (event: Event) => {
    // Allow both coaches and individual athletes to delete workouts
    if (event.type !== "workout" || (userRole !== 'coach' && userRole !== 'individual_athlete')) return;
    
    try {
      console.log("Attempting to delete workout:", event);
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", event.id);

      if (error) {
        console.error("Error deleting workout:", error);
        throw error;
      }

      console.log("Workout deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["workouts", programId] });
      // Invalider également la requête des programmes pour mettre à jour la vue
      await queryClient.invalidateQueries({ queryKey: ["shared-programs"] });

      toast("Séance supprimée avec succès");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast("Une erreur est survenue lors de la suppression de la séance");
    }
  };

  return {
    handleDuplicateWorkout,
    handleDeleteWorkout,
  };
};
