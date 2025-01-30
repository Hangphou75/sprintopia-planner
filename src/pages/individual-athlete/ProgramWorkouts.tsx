import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProgramWorkoutCalendar } from "@/components/programs/ProgramWorkoutCalendar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const IndividualProgramWorkouts = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: workouts = [], isLoading: isLoadingWorkouts, error: workoutsError } = useQuery({
    queryKey: ["workouts", programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("program_id", programId)
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching workouts:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!programId,
  });

  const { data: competitions = [], isLoading: isLoadingCompetitions, error: competitionsError } = useQuery({
    queryKey: ["competitions", programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .eq("program_id", programId)
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching competitions:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!programId,
  });

  if (workoutsError || competitionsError) {
    toast.error("Une erreur est survenue lors du chargement des données");
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">
          Une erreur est survenue lors du chargement des données. Veuillez réessayer.
        </div>
      </div>
    );
  }

  if (isLoadingWorkouts || isLoadingCompetitions) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Séances</h1>
        <Button onClick={() => navigate(`/individual-athlete/programs/${programId}/workouts/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle séance
        </Button>
      </div>

      <ProgramWorkoutCalendar
        workouts={workouts}
        competitions={competitions}
        programId={programId || ""}
      />
    </div>
  );
};