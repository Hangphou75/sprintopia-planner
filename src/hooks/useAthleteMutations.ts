
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
    mutationFn: async ({ coachId, programId, athleteId }: { coachId: string; programId: string; athleteId?: string }) => {
      const query = supabase
        .from("shared_programs")
        .delete()
        .eq("program_id", programId)
        .eq("coach_id", coachId);

      // Si un athleteId est fourni, on filtre également par cet ID
      if (athleteId) {
        query.eq("athlete_id", athleteId);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-athletes"] });
      queryClient.invalidateQueries({ queryKey: ["athlete-programs"] });
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Programme retiré avec succès");
    },
    onError: (error) => {
      console.error("Error deleting program:", error);
      toast.error("Erreur lors de la suppression du programme");
    },
  });

  const assignProgramMutation = useMutation({
    mutationFn: async ({ coachId, athleteId, programId }: { coachId: string; athleteId: string; programId: string }) => {
      const { error } = await supabase
        .from("shared_programs")
        .insert({
          coach_id: coachId,
          athlete_id: athleteId,
          program_id: programId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      // On invalide toutes les queries qui pourraient avoir besoin d'être mises à jour
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["coach-athletes"] });
      queryClient.invalidateQueries({ queryKey: ["athlete-programs"] });
      toast.success("Programme associé avec succès");
    },
    onError: (error) => {
      console.error("Error assigning program:", error);
      toast.error("Erreur lors de l'association du programme");
    },
  });

  return {
    inviteMutation,
    deleteAthleteMutation,
    deleteProgramMutation,
    assignProgramMutation,
  };
};
