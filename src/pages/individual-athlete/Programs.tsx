import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const IndividualAthletePrograms = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: programs, isLoading } = useQuery({
    queryKey: ["programs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select(`
          *,
          shared_programs (
            athlete:profiles!shared_programs_athlete_id_fkey (
              id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error fetching programs:", error);
        toast.error("Erreur lors du chargement des programmes");
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleProgramClick = (programId: string) => {
    navigate(`/individual-athlete/planning/${programId}`);
  };

  const handleCreateProgram = () => {
    navigate("/individual-athlete/programs/new");
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
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes programmes</h1>
        <Button onClick={handleCreateProgram}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau programme
        </Button>
      </div>

      {programs && programs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onClick={() => handleProgramClick(program.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Aucun programme</h2>
          <p className="text-muted-foreground mb-8">
            Vous n'avez pas encore créé de programme d'entraînement.
          </p>
          <Button onClick={handleCreateProgram}>
            <Plus className="h-4 w-4 mr-2" />
            Créer mon premier programme
          </Button>
        </div>
      )}
    </div>
  );
};