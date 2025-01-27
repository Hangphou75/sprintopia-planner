import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Event } from "../types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

type UseWorkoutActionsProps = {
  programId: string;
  userRole?: string;
};

export const useWorkoutActions = ({ programId, userRole }: UseWorkoutActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDuplicateWorkout = async (event: Event) => {
    if (event.type !== "workout" || userRole !== 'coach') return;
    
    try {
      const { data, error } = await supabase
        .from("workouts")
        .insert({
          program_id: programId,
          title: `${event.title} (copie)`,
          description: event.description,
          date: event.date.toISOString(),
          time: event.time,
          theme: event.theme,
          details: event.details,
        })
        .select()
        .single();

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["workouts", programId] });

      toast({
        title: "Séance dupliquée",
        description: "La séance a été dupliquée avec succès.",
      });
    } catch (error) {
      console.error("Error duplicating workout:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la duplication de la séance.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWorkout = async (event: Event) => {
    if (event.type !== "workout" || userRole !== 'coach') return;
    
    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", event.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["workouts", programId] });

      toast({
        title: "Séance supprimée",
        description: "La séance a été supprimée avec succès.",
      });
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la séance.",
        variant: "destructive",
      });
    }
  };

  return {
    handleDuplicateWorkout,
    handleDeleteWorkout,
  };
};