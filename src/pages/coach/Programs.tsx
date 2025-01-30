import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const Programs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  const { data: programs, isLoading } = useQuery({
    queryKey: ["programs", user?.id],
    queryFn: async () => {
      console.log("Fetching programs for user:", user?.id);
      const { data, error } = await supabase
        .from("programs")
        .select(`
          *,
          competitions(*),
          shared_programs(
            athlete:profiles!shared_programs_athlete_id_fkey(
              id,
              first_name,
              last_name,
              email
            )
          ),
          coach:profiles!programs_user_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Programs fetched:", data);
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: athletes } = useQuery({
    queryKey: ["coach-athletes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_athletes")
        .select(`
          athlete:profiles!coach_athletes_athlete_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq("coach_id", user?.id);

      if (error) throw error;
      return data;
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

  const handleShare = async (athleteId: string) => {
    if (!user?.id || !selectedProgramId) return;

    try {
      const { error } = await supabase
        .from("shared_programs")
        .insert({
          program_id: selectedProgramId,
          athlete_id: athleteId,
          coach_id: user.id,
        });

      if (error) throw error;

      toast.success("Programme partagé avec succès");
      setIsShareDialogOpen(false);
      setSelectedProgramId(null);
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    } catch (error) {
      console.error("Error sharing program:", error);
      toast.error("Erreur lors du partage du programme");
    }
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

  const onShareProgram = (programId: string) => {
    console.log("Opening share dialog for program:", programId);
    setSelectedProgramId(programId);
    setIsShareDialogOpen(true);
  };

  const handleEdit = (programId: string) => {
    console.log("Navigating to edit program:", programId);
    navigate(`/coach/programs/${programId}/edit`);
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
    <div className="container mx-auto py-6 px-4 max-w-5xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes programmes</h1>
        <Button onClick={() => navigate("/coach/programs/new")}>
          Nouveau programme
        </Button>
      </div>

      <ScrollArea className="flex-1 px-1">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {!programs || programs.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-8">
              Aucun programme créé
            </p>
          ) : (
            programs.map((program) => (
              <ProgramCard 
                key={program.id} 
                program={program}
                onShare={onShareProgram}
                onDelete={handleDelete}
                onDuplicate={(id) => duplicateMutation.mutate(id)}
                onEdit={handleEdit}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <Dialog 
        open={isShareDialogOpen} 
        onOpenChange={(open) => {
          setIsShareDialogOpen(open);
          if (!open) setSelectedProgramId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Associer le programme</DialogTitle>
            <DialogDescription>
              Choisissez un athlète à qui associer ce programme
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {athletes?.map((relation) => (
              <Button
                key={relation.athlete.id}
                variant="outline"
                className="justify-start"
                onClick={() => handleShare(relation.athlete.id)}
              >
                {relation.athlete.first_name} {relation.athlete.last_name}
              </Button>
            ))}
            {(!athletes || athletes.length === 0) && (
              <p className="text-muted-foreground text-center">
                Aucun athlète disponible
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

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

export default Programs;