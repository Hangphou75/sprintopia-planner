import { Program } from "@/types/program";
import { Button } from "@/components/ui/button";
import { CalendarDays, Copy, Edit, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ProgramCardProps = {
  program: Program;
  onDelete?: () => void;
};

export const ProgramCard = ({ program, onDelete }: ProgramCardProps) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      // Delete associated competitions
      const { error: competitionsError } = await supabase
        .from('competitions')
        .delete()
        .eq('program_id', program.id);

      if (competitionsError) throw competitionsError;

      // Delete associated workouts
      const { error: workoutsError } = await supabase
        .from('workouts')
        .delete()
        .eq('program_id', program.id);

      if (workoutsError) throw workoutsError;

      // Delete the program
      const { error: programError } = await supabase
        .from('programs')
        .delete()
        .eq('id', program.id);

      if (programError) throw programError;

      toast.success("Programme supprimé avec succès");
      if (onDelete) onDelete();
    } catch (error) {
      console.error('Error deleting program:', error);
      toast.error("Erreur lors de la suppression du programme");
    }
  };

  const handleDuplicate = async () => {
    try {
      // Duplicate program
      const { data: newProgram, error: programError } = await supabase
        .from('programs')
        .insert({
          ...program,
          id: undefined,
          name: `${program.name} (copie)`,
          created_at: undefined,
          updated_at: undefined
        })
        .select()
        .single();

      if (programError) throw programError;

      // Get competitions
      const { data: competitions, error: getCompError } = await supabase
        .from('competitions')
        .select('*')
        .eq('program_id', program.id);

      if (getCompError) throw getCompError;

      // Duplicate competitions
      if (competitions && competitions.length > 0) {
        const { error: compError } = await supabase
          .from('competitions')
          .insert(
            competitions.map(comp => ({
              ...comp,
              id: undefined,
              program_id: newProgram.id,
              created_at: undefined
            }))
          );

        if (compError) throw compError;
      }

      // Get workouts
      const { data: workouts, error: getWorkError } = await supabase
        .from('workouts')
        .select('*')
        .eq('program_id', program.id);

      if (getWorkError) throw getWorkError;

      // Duplicate workouts
      if (workouts && workouts.length > 0) {
        const { error: workError } = await supabase
          .from('workouts')
          .insert(
            workouts.map(workout => ({
              ...workout,
              id: undefined,
              program_id: newProgram.id,
              created_at: undefined,
              updated_at: undefined
            }))
          );

        if (workError) throw workError;
      }

      toast.success("Programme dupliqué avec succès");
      navigate(`/coach/programs/${newProgram.id}/workouts`);
    } catch (error) {
      console.error('Error duplicating program:', error);
      toast.error("Erreur lors de la duplication du programme");
    }
  };

  return (
    <Card className="w-full max-w-md hover:border-primary transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold">{program.name}</CardTitle>
        <CardDescription className="text-base">
          {program.duration} semaines - Début le{" "}
          {new Date(program.start_date).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        {program.objectives && (
          <p className="text-base text-muted-foreground">
            {program.objectives}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 pt-3 border-t">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/coach/programs/${program.id}/edit`)}
          className="flex-1"
        >
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/coach/programs/${program.id}/workouts`)}
          className="flex-1"
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          Séances
        </Button>
        <Button 
          variant="outline"
          size="sm"
          onClick={handleDuplicate}
          className="flex-1"
        >
          <Copy className="h-4 w-4 mr-2" />
          Dupliquer
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive"
              size="sm"
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Cela supprimera définitivement le programme
                et toutes les séances associées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button 
          size="sm"
          onClick={() => navigate(`/coach/programs/${program.id}/workouts/new`)}
          className="w-full mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une séance
        </Button>
      </CardFooter>
    </Card>
  );
};