import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Timer, Zap, Flame, Dumbbell, Sparkles, Activity, ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ProgramWorkoutCalendar } from "@/components/programs/ProgramWorkoutCalendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Liste des séances</h2>
            <Select defaultValue="date">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="theme">Type de séance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {workouts?.map((workout) => {
              const Icon = workout.theme ? themeIcons[workout.theme as keyof typeof themeIcons] : Timer;
              return (
                <div
                  key={workout.id}
                  className={cn(
                    "p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer",
                    workout.theme && `border-theme-${workout.theme}`
                  )}
                  onClick={() => navigate(`/coach/programs/${programId}/workouts/${workout.id}/edit`)}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn(
                      "h-5 w-5",
                      workout.theme && `text-theme-${workout.theme}`
                    )} />
                    <h3 className="font-semibold">{workout.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(workout.date).toLocaleDateString()} à {workout.time || "Non défini"}
                  </p>
                  <p className="text-sm">{workout.theme}</p>
                </div>
              );
            })}
            {(!workouts || workouts.length === 0) && (
              <p className="text-center text-muted-foreground">Aucune séance créée</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};