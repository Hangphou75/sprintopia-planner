
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "@/types/database";

export const useAthleteMutations = () => {
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: async ({ coachId, email }: { coachId: string; email: string }) => {
      // Vérifier si l'athlète existe déjà
      const { data: existingInvitations, error: checkError } = await supabase
        .from("athlete_invitations")
        .select("*")
        .eq("coach_id", coachId)
        .eq("email", email)
        .eq("status", "pending");

      if (checkError) throw checkError;
      
      if (existingInvitations && existingInvitations.length > 0) {
        throw new Error("Une invitation a déjà été envoyée à cet athlète");
      }

      // Créer l'invitation
      const { error } = await supabase
        .from("athlete_invitations")
        .insert([{ coach_id: coachId, email, status: "pending" }]);

      if (error) throw error;
      
      // Déclencher l'envoi de l'email d'invitation via la Edge Function
      const { data: coachData } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", coachId)
        .single();
        
      const coachName = coachData 
        ? `${coachData.first_name} ${coachData.last_name}` 
        : "Votre coach";
        
      // Call the edge function to send invitation email
      const functionUrl = "https://oolikhpmpzqoptnnzctx.supabase.co/functions/v1/send-invitation";
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabase.auth.getSession()}`
        },
        body: JSON.stringify({ email, coachName })
      });
      
      if (!response.ok) {
        console.error("Error sending invitation email:", await response.text());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-athletes"] });
      toast.success("Invitation envoyée avec succès");
    },
    onError: (error: any) => {
      console.error("Error sending invitation:", error);
      if (error.message === "Une invitation a déjà été envoyée à cet athlète") {
        toast.error(error.message);
      } else {
        toast.error("Erreur lors de l'envoi de l'invitation");
      }
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
    },
    onError: (error) => {
      console.error("Error deleting athlete:", error);
      toast.error("Erreur lors de la suppression de l'athlète");
    },
  });

  const deleteProgramMutation = useMutation({
    mutationFn: async ({ 
      coachId, 
      programId, 
      athleteId,
      sharedId 
    }: { 
      coachId: string; 
      programId: string; 
      athleteId?: string;
      sharedId?: string;
    }) => {
      let query;
      
      // Si un sharedId est fourni, on utilise cet ID directement
      if (sharedId) {
        query = supabase
          .from("shared_programs")
          .delete()
          .eq("id", sharedId);
      } else {
        // Sinon, on utilise les autres paramètres
        query = supabase
          .from("shared_programs")
          .delete()
          .eq("program_id", programId)
          .eq("coach_id", coachId);

        // Si un athleteId est fourni, on filtre également par cet ID
        if (athleteId) {
          query.eq("athlete_id", athleteId);
        }
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-athletes"] });
      queryClient.invalidateQueries({ queryKey: ["athlete-programs"] });
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (error) => {
      console.error("Error deleting program:", error);
      toast.error("Erreur lors de la suppression du programme");
    },
  });

  const assignProgramMutation = useMutation({
    mutationFn: async ({ coachId, athleteId, programId }: { coachId: string; athleteId: string; programId: string }) => {
      // Vérifier si le programme est déjà associé à l'athlète
      const { data: existingShared, error: checkError } = await supabase
        .from("shared_programs")
        .select("*")
        .eq("coach_id", coachId)
        .eq("athlete_id", athleteId)
        .eq("program_id", programId);
        
      if (checkError) throw checkError;
      
      if (existingShared && existingShared.length > 0) {
        throw new Error("Ce programme est déjà associé à cet athlète");
      }

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
    onError: (error: any) => {
      console.error("Error assigning program:", error);
      if (error.message === "Ce programme est déjà associé à cet athlète") {
        toast.error(error.message);
      } else {
        toast.error("Erreur lors de l'association du programme");
      }
    },
  });

  return {
    inviteMutation,
    deleteAthleteMutation,
    deleteProgramMutation,
    assignProgramMutation,
  };
};
