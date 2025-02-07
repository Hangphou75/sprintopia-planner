
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useProgramOperations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (programId: string) => {
      const { error } = await supabase
        .from("programs")
        .delete()
        .eq("id", programId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs", user?.id] });
      toast.success("Programme supprimé avec succès");
    },
    onError: (error) => {
      console.error("Error deleting program:", error);
      toast.error("Erreur lors de la suppression du programme");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (programId: string) => {
      // Fetch the program to duplicate
      const { data: program, error: fetchError } = await supabase
        .from("programs")
        .select("*")
        .eq("id", programId)
        .single();

      if (fetchError) throw fetchError;

      // Create new program with the current user as owner
      const { data: newProgram, error: createError } = await supabase
        .from("programs")
        .insert({
          name: `${program.name} (copie)`,
          duration: program.duration,
          objectives: program.objectives,
          start_date: program.start_date,
          user_id: user?.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Duplicate competitions
      const { data: competitions, error: compFetchError } = await supabase
        .from("competitions")
        .select("*")
        .eq("program_id", programId);

      if (compFetchError) throw compFetchError;

      if (competitions && competitions.length > 0) {
        const { error: compCreateError } = await supabase
          .from("competitions")
          .insert(
            competitions.map((comp) => ({
              ...comp,
              id: undefined,
              program_id: newProgram.id,
            }))
          );

        if (compCreateError) throw compCreateError;
      }

      // Duplicate workouts
      const { data: workouts, error: workoutFetchError } = await supabase
        .from("workouts")
        .select("*")
        .eq("program_id", programId);

      if (workoutFetchError) throw workoutFetchError;

      if (workouts && workouts.length > 0) {
        const { error: workoutCreateError } = await supabase
          .from("workouts")
          .insert(
            workouts.map((workout) => ({
              ...workout,
              id: undefined,
              program_id: newProgram.id,
            }))
          );

        if (workoutCreateError) throw workoutCreateError;
      }

      return newProgram;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs", user?.id] });
      toast.success("Programme dupliqué avec succès");
    },
    onError: (error) => {
      console.error("Error duplicating program:", error);
      toast.error("Erreur lors de la duplication du programme");
    },
  });

  return {
    deleteMutation,
    duplicateMutation,
  };
};
