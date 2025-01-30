import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Program } from "@/types/program";

const IndividualAthletePlanning = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const handleCreateProgram = () => {
    navigate("/individual-athlete/programs/new");
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
            <ProgramCard key={program.id} program={program} />
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
    </div>
  );
};

export default IndividualAthletePlanning;