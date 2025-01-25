import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Timer, Zap, Flame, Dumbbell, Sparkles, Activity, ArrowUp, Trophy, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgramWorkoutCalendar } from "@/components/programs/ProgramWorkoutCalendar";
import { useToast } from "@/hooks/use-toast";
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

const themeIcons = {
  aerobic: Timer,
  "anaerobic-alactic": Zap,
  "anaerobic-lactic": Flame,
  strength: Dumbbell,
  technical: Sparkles,
  mobility: Activity,
  plyometric: ArrowUp,
};

export const ProgramWorkouts = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workouts, isLoading: isLoadingWorkouts } = useQuery({
    queryKey: ["workouts", programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("program_id", programId)
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: competitions, isLoading: isLoadingCompetitions } = useQuery({
    queryKey: ["competitions", programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .eq("program_id", programId)
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handleDuplicateWorkout = async (workout: any) => {
    const { id, created_at, updated_at, ...workoutData } = workout;
    
    try {
      const { data, error } = await supabase
        .from("workouts")
        .insert([{ ...workoutData, title: `${workoutData.title} (copie)` }])
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast({
        title: "Séance dupliquée",
        description: "La séance a été dupliquée avec succès.",
      });
    } catch (error) {
      console.error("Error duplicating workout:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la duplication de la séance.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workoutId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast({
        title: "Séance supprimée",
        description: "La séance a été supprimée avec succès.",
      });
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la séance.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingWorkouts || isLoadingCompetitions) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Séances d'entraînement</h1>
        <Button onClick={() => navigate(`/coach/programs/${programId}/workouts/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle séance
        </Button>
      </div>

      <div className="space-y-8">
        <ProgramWorkoutCalendar
          workouts={workouts || []}
          competitions={competitions || []}
          programId={programId || ""}
        />

        <div className="grid gap-8">
          {/* Liste des séances */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Liste des séances</h2>
            <div className="grid gap-4">
              {workouts?.map((workout) => {
                const Icon = workout.theme ? themeIcons[workout.theme as keyof typeof themeIcons] : Timer;
                return (
                  <div
                    key={workout.id}
                    className={cn(
                      "p-4 border rounded-lg hover:border-primary transition-colors",
                      workout.theme && `border-theme-${workout.theme}`
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/coach/programs/${programId}/workouts/${workout.id}/edit`)}>
                        <Icon className={cn(
                          "h-5 w-5",
                          workout.theme && `text-theme-${workout.theme}`
                        )} />
                        <div>
                          <h3 className="font-semibold">{workout.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(workout.date).toLocaleDateString()} à {workout.time || "Non défini"}
                          </p>
                          <p className="text-sm">{workout.theme}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicateWorkout(workout)}
                        >
                          <Copy className="h-4 w-4" />
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
                                Cette action est irréversible. La séance sera définitivement supprimée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteWorkout(workout.id)}
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!workouts || workouts.length === 0) && (
                <p className="text-center text-muted-foreground">Aucune séance créée</p>
              )}
            </div>
          </div>

          {/* Liste des compétitions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Liste des compétitions</h2>
            <div className="grid gap-4">
              {competitions?.map((competition) => (
                <div
                  key={competition.id}
                  className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                  onClick={() => navigate(`/coach/programs/${programId}/competitions/${competition.id}/edit`)}
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <div>
                      <h3 className="font-semibold">{competition.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(competition.date).toLocaleDateString()} à {competition.time || "Non défini"}
                      </p>
                      <p className="text-sm">
                        {competition.distance} - {competition.level}
                        {competition.is_main && " (Objectif principal)"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {(!competitions || competitions.length === 0) && (
                <p className="text-center text-muted-foreground">Aucune compétition créée</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};