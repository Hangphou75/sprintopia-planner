
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
        ? `${coachData.first_name || ''} ${coachData.last_name || ''}`.trim() || "Votre coach"
        : "Votre coach";
        
      // Call the edge function to send invitation email
      const functionUrl = "https://oolikhpmpzqoptnnzctx.supabase.co/functions/v1/send-invitation";
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ email, coachName })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error sending invitation email:", errorText);
        
        // L'invitation a été créée dans la base de données,
        // mais l'envoi d'email a échoué, on informe l'utilisateur
        // mais on ne lance pas d'erreur pour ne pas annuler la création
        // de l'invitation
        toast.warning("L'invitation a été créée mais l'email n'a pas pu être envoyé. Problème de configuration du service d'emails.");
        
        // On ne lance pas d'erreur pour que le processus soit considéré comme réussi
        // puisque l'invitation a bien été créée dans la base
        return { status: "invitation_created_email_failed", email };
      }
      
      return { status: "success", email };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["coach-athletes"] });
      queryClient.invalidateQueries({ queryKey: ["athlete-invitations"] });
      
      if (data.status === "invitation_created_email_failed") {
        // On a déjà affiché un toast dans la mutationFn
      } else {
        toast.success("Invitation envoyée avec succès");
      }
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
      // For admin users, we don't need to check coachId
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", coachId)
        .single();
        
      const isAdmin = userProfile?.role === "admin";
      
      let query;
      if (isAdmin) {
        // Admin can delete any coach-athlete relationship
        query = supabase
          .from("coach_athletes")
          .delete()
          .eq("athlete_id", athleteId);
      } else {
        // Regular coach can only delete their own relationships
        query = supabase
          .from("coach_athletes")
          .delete()
          .eq("athlete_id", athleteId)
          .eq("coach_id", coachId);
      }
      
      const { error } = await query;
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
      // Check if admin
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", coachId)
        .single();
        
      const isAdmin = userProfile?.role === "admin";
      
      let query;
      
      // Si un sharedId est fourni, on utilise cet ID directement
      if (sharedId) {
        query = supabase
          .from("shared_programs")
          .delete()
          .eq("id", sharedId);
      } else {
        // Si c'est un admin, on ne filtre pas par coach_id
        if (isAdmin) {
          query = supabase
            .from("shared_programs")
            .delete()
            .eq("program_id", programId);
        } else {
          // Pour les coaches normaux, on filtre aussi par coach_id
          query = supabase
            .from("shared_programs")
            .delete()
            .eq("program_id", programId)
            .eq("coach_id", coachId);
        }

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
