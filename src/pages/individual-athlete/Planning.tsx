import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Program } from "@/types/program";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const IndividualAthletePlanning = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  const { data: programs = [], isLoading } = useQuery<Program[]>({
    queryKey: ["programs", user?.id],
    queryFn: async () => {
      console.log("Fetching programs for planning page, user:", user?.id);
      
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching programs:", error);
        throw error;
      }

      console.log("Programs data for planning:", data);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (programId: string) => {
      const { error } = await supabase
        .from("programs")
        .delete()
        .eq("id", programId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Programme supprimé avec succès");
      setIsDeleteDialogOpen(false);
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

      // Create new program
      const { data: newProgram, error: createError } = await supabase
        .from("programs")
        .insert({
          ...program,
          id: undefined,
          name: `${program.name} (copie)`,
          user_id: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Programme dupliqué avec succès");
    },
    onError: (error) => {
      console.error("Error duplicating program:", error);
      toast.error("Erreur lors de la duplication du programme");
    },
  });

  const handleCreateProgram = () => {
    navigate("/individual-athlete/programs/new");
  };

  const handleDelete = (programId: string) => {
    setSelectedProgramId(programId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProgramId) {
      deleteMutation.mutate(selectedProgramId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement des programmes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mes programmes</h1>
        <Button onClick={handleCreateProgram}>
          <Plus className="h-4 w-4 mr-2" />
          Créer un programme
        </Button>
      </div>

      {programs && programs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard 
              key={program.id} 
              program={program}
              onDelete={handleDelete}
              onDuplicate={(id) => duplicateMutation.mutate(id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <p className="text-muted-foreground">Vous n'avez pas encore créé de programme</p>
          <Button 
            variant="outline" 
            onClick={handleCreateProgram}
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer mon premier programme
          </Button>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le programme et toutes ses séances seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IndividualAthletePlanning;