import { useNavigate } from "react-router-dom";
import { CalendarDays, Edit, Trash2, UserPlus } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CompetitionCard } from "./CompetitionCard";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

type ProgramCardProps = {
  program: any;
  onDelete?: () => void;
  readOnly?: boolean;
};

export const ProgramCard = ({ program, onDelete, readOnly = false }: ProgramCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch athletes for the coach
  const { data: athletes } = useQuery({
    queryKey: ["coach-athletes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_athletes")
        .select(`
          id,
          athlete:profiles!coach_athletes_athlete_id_fkey(
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
    enabled: !readOnly && !!user?.id,
  });

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

  const handleShareProgram = async (athleteId: string) => {
    try {
      const { error } = await supabase
        .from("shared_programs")
        .insert([{
          program_id: program.id,
          athlete_id: athleteId,
          coach_id: user?.id,
          status: 'active'
        }]);

      if (error) throw error;

      toast.success("Programme partagé avec succès");
    } catch (error) {
      console.error("Error sharing program:", error);
      toast.error("Erreur lors du partage du programme");
    }
  };

  const handleWorkoutsClick = () => {
    const path = readOnly ? `/athlete/programs/${program.id}/workouts` : `/coach/programs/${program.id}/workouts`;
    navigate(path);
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
              onClick={handleWorkoutsClick}
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
            {!readOnly && (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Associer des athlètes</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {athletes?.map((relation) => (
                        <Button
                          key={relation.athlete.id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => handleShareProgram(relation.athlete.id)}
                        >
                          {relation.athlete.first_name} {relation.athlete.last_name}
                        </Button>
                      ))}
                      {(!athletes || athletes.length === 0) && (
                        <p className="text-center text-muted-foreground">
                          Aucun athlète disponible
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
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