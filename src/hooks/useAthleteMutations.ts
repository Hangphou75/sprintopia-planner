import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "@/types/database";

export const useAthleteMutations = () => {
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: async ({ coachId, email }: { coachId: string; email: string }) => {
      const { error } = await supabase
        .from("athlete_invitations")
        .insert([{ coach_id: coachId, email }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-athletes"] });
      toast.success("Invitation envoyée avec succès");
    },
    onError: (error) => {
      console.error("Error sending invitation:", error);
      toast.error("Erreur lors de l'envoi de l'invitation");
    },
  });

  const deleteAthleteMutation = useMutation({
    mutationFn: async ({ coachId, athleteId }: { coachId: string; athleteId: string }) => {
      const { error } = await supabase
        .from("coach_athletes")
        .delete()
        .eq("athlete_id", athleteId)
        .eq("coach_id", coachId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-athletes"] });
      toast.success("Athlète supprimé avec succès");
    },
    onError: (error) => {
      console.error("Error deleting athlete:", error);
      toast.error("Erreur lors de la suppression de l'athlète");
    },
  });

  const deleteProgramMutation = useMutation({
    mutationFn: async ({ coachId, programId }: { coachId: string; programId: string }) => {
      const { error } = await supabase
        .from("shared_programs")
        .delete()
        .eq("program_id", programId)
        .eq("coach_id", coachId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["athlete-programs"] });
      toast.success("Programme supprimé avec succès");
    },
    onError: (error) => {
      console.error("Error deleting program:", error);
      toast.error("Erreur lors de la suppression du programme");
    },
  });

  return {
    inviteMutation,
    deleteAthleteMutation,
    deleteProgramMutation,
  };
};