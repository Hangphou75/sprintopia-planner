import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProgramWorkoutCalendar } from "@/components/programs/ProgramWorkoutCalendar";

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
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
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

      <ProgramWorkoutCalendar
        workouts={workouts || []}
        competitions={competitions || []}
        programId={programId || ""}
      />
    </div>
  );
};