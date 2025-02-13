
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export const useProgramActions = (refetch: () => void) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleCreateProgram = () => {
    navigate("/individual-athlete/programs/new");
  };

  const handleGenerateProgram = () => {
    navigate("/individual-athlete/programs/generate");
  };

  const handleEditProgram = (programId: string) => {
    navigate(`/individual-athlete/programs/${programId}/edit`);
  };

  const handleDuplicateProgram = async (programId: string, userId: string | undefined, programs: any[]) => {
    try {
      const programToDuplicate = programs?.find(p => p.id === programId);
      if (!programToDuplicate) return;

      const { data: newProgram, error: programError } = await supabase
        .from("programs")
        .insert({
          ...programToDuplicate,
          id: undefined,
          name: `${programToDuplicate.name} (copie)`,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (programError) throw programError;

      const { data: competitions } = await supabase
        .from("competitions")
        .select("*")
        .eq("program_id", programId);

      if (competitions && competitions.length > 0) {
        const newCompetitions = competitions.map(comp => ({
          ...comp,
          id: undefined,
          program_id: newProgram.id,
          created_at: new Date().toISOString()
        }));

        const { error: competitionsError } = await supabase
          .from("competitions")
          .insert(newCompetitions);

        if (competitionsError) throw competitionsError;
      }

      const { data: workouts } = await supabase
        .from("workouts")
        .select("*")
        .eq("program_id", programId);

      if (workouts && workouts.length > 0) {
        const newWorkouts = workouts.map(workout => ({
          ...workout,
          id: undefined,
          program_id: newProgram.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: workoutsError } = await supabase
          .from("workouts")
          .insert(newWorkouts);

        if (workoutsError) throw workoutsError;
      }

      toast.success("Programme dupliqué avec succès");
      await queryClient.invalidateQueries({ queryKey: ["programs"] });
      refetch();
    } catch (error) {
      console.error("Erreur lors de la duplication du programme:", error);
      toast.error("Erreur lors de la duplication du programme");
    }
  };

  const handleDeleteProgram = async () => {
    if (!programToDelete) return;

    try {
      // Supprimer d'abord les séances
      const { error: workoutsError } = await supabase
        .from("workouts")
        .delete()
        .eq("program_id", programToDelete);

      if (workoutsError) throw workoutsError;

      // Supprimer les compétitions
      const { error: competitionsError } = await supabase
        .from("competitions")
        .delete()
        .eq("program_id", programToDelete);

      if (competitionsError) throw competitionsError;

      // Supprimer le programme
      const { error: programError } = await supabase
        .from("programs")
        .delete()
        .eq("id", programToDelete);

      if (programError) throw programError;

      toast.success("Programme supprimé avec succès");
      setIsDeleteDialogOpen(false);
      setProgramToDelete(null);
      
      // Invalider le cache et forcer le rafraîchissement
      await queryClient.invalidateQueries({ queryKey: ["programs"] });
      await refetch();
      
      // Rediriger vers la page des programmes avec un petit délai
      setTimeout(() => {
        navigate("/individual-athlete/planning", { replace: true });
      }, 100);
    } catch (error) {
      console.error("Erreur lors de la suppression du programme:", error);
      toast.error("Erreur lors de la suppression du programme");
      setIsDeleteDialogOpen(false);
      setProgramToDelete(null);
    }
  };

  return {
    programToDelete,
    setProgramToDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleCreateProgram,
    handleGenerateProgram,
    handleEditProgram,
    handleDuplicateProgram,
    handleDeleteProgram
  };
};
