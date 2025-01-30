import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Settings, ArrowLeft } from "lucide-react";
import { ProgramWorkoutCalendar } from "@/components/programs/ProgramWorkoutCalendar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

export const ProgramWorkouts = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const { data: workouts, isLoading: isLoadingWorkouts, error: workoutsError } = useQuery({
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

  const { data: competitions, isLoading: isLoadingCompetitions, error: competitionsError } = useQuery({
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
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Séances</h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size={isMobile ? "icon" : "default"}
              onClick={() => navigate(`/coach/programs/${programId}/edit`)}
            >
              <Settings className="h-4 w-4" />
              {!isMobile && "Paramètres du programme"}
            </Button>
            <Button 
              size={isMobile ? "icon" : "default"}
              onClick={() => navigate(`/coach/programs/${programId}/workouts/new`)}
            >
              <Plus className="h-4 w-4" />
              {!isMobile && "Nouvelle séance"}
            </Button>
          </div>
        </div>
      </div>

      <ProgramWorkoutCalendar
        workouts={workouts || []}
        competitions={competitions || []}
        programId={programId || ""}
      />
    </div>
  );
};