import { useNavigate } from "react-router-dom";
import { CalendarDays, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CompetitionCard } from "./CompetitionCard";

type ProgramCardProps = {
  program: any;
  onDelete?: () => void;
  readOnly?: boolean;
};

export const ProgramCard = ({ program, onDelete, readOnly = false }: ProgramCardProps) => {
  const navigate = useNavigate();

  const handleDeleteProgram = async () => {
    try {
      const { error } = await supabase
        .from("programs")
        .delete()
        .eq("id", program.id);

      if (error) throw error;

      toast.success("Programme supprimé avec succès");
      onDelete?.();
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error("Erreur lors de la suppression du programme");
    }
  };

  const handleDeleteCompetition = async (competition: any) => {
    try {
      const { error } = await supabase
        .from("competitions")
        .delete()
        .eq("id", competition.id);

      if (error) throw error;

      toast.success("Compétition supprimée avec succès");
      onDelete?.();
    } catch (error) {
      console.error("Error deleting competition:", error);
      toast.error("Erreur lors de la suppression de la compétition");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{program.name}</CardTitle>
            <CardDescription>
              {format(new Date(program.start_date), "d MMMM yyyy", {
                locale: fr,
              })}
              {" • "}
              {program.duration} semaines
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/${readOnly ? 'athlete' : 'coach'}/programs/${program.id}/workouts`)}
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
            {!readOnly && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/coach/programs/${program.id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Le programme et toutes ses séances seront définitivement supprimés.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteProgram}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {program.objectives && (
          <p className="text-sm text-muted-foreground mb-6">
            {program.objectives}
          </p>
        )}
        <div className="space-y-4">
          {program.competitions?.map((competition: any) => (
            <CompetitionCard
              key={competition.id}
              competition={competition}
              onEdit={!readOnly ? () => navigate(`/coach/programs/${program.id}/edit`) : undefined}
              onDelete={!readOnly ? handleDeleteCompetition : undefined}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};