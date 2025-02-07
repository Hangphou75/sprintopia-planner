
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Button } from "@/components/ui/button";
import { Plus, Wand2 } from "lucide-react";
import { useAthletePrograms } from "@/hooks/useAthletePrograms";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { DeleteProgramDialog } from "./components/DeleteProgramDialog";
import { toast } from "sonner";

export default function Programs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: programs, isLoading, refetch } = useAthletePrograms(user?.id);
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);

  const handleCreateProgram = () => {
    navigate("/individual-athlete/programs/new");
  };

  const handleGenerateProgram = () => {
    navigate("/individual-athlete/programs/generate");
  };

  const handleEditProgram = (programId: string) => {
    navigate(`/individual-athlete/programs/${programId}/edit`);
  };

  const handleDuplicateProgram = async (programId: string) => {
    try {
      const programToDuplicate = programs?.find(p => p.id === programId);
      if (!programToDuplicate) return;

      // Dupliquer le programme
      const { data: newProgram, error: programError } = await supabase
        .from("programs")
        .insert({
          ...programToDuplicate,
          id: undefined,
          name: `${programToDuplicate.name} (copie)`,
          user_id: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (programError) throw programError;

      // Dupliquer les compétitions associées
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

      // Dupliquer les séances associées
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
      refetch();
    } catch (error) {
      console.error("Erreur lors de la duplication du programme:", error);
      toast.error("Erreur lors de la duplication du programme");
    }
  };

  const handleDeleteProgram = async () => {
    if (!programToDelete) return;

    try {
      // Supprimer les séances associées
      const { error: workoutsError } = await supabase
        .from("workouts")
        .delete()
        .eq("program_id", programToDelete);

      if (workoutsError) throw workoutsError;

      // Supprimer les compétitions associées
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
      setProgramToDelete(null);
      refetch();
    } catch (error) {
      console.error("Erreur lors de la suppression du programme:", error);
      toast.error("Erreur lors de la suppression du programme");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement des programmes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes programmes</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateProgram}>
            <Wand2 className="h-4 w-4 mr-2" />
            Générer un programme
          </Button>
          <Button onClick={handleCreateProgram}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau programme
          </Button>
        </div>
      </div>

      {programs && programs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onDelete={(id) => setProgramToDelete(id)}
              onEdit={handleEditProgram}
              onDuplicate={handleDuplicateProgram}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Aucun programme</h2>
          <p className="text-muted-foreground mb-8">
            Vous n'avez pas encore créé de programme d'entraînement.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleGenerateProgram}>
              <Wand2 className="h-4 w-4 mr-2" />
              Générer un programme
            </Button>
            <Button onClick={handleCreateProgram}>
              <Plus className="h-4 w-4 mr-2" />
              Créer mon premier programme
            </Button>
          </div>
        </div>
      )}

      <DeleteProgramDialog
        isOpen={!!programToDelete}
        onOpenChange={(open) => !open && setProgramToDelete(null)}
        onConfirm={handleDeleteProgram}
      />
    </div>
  );
}
