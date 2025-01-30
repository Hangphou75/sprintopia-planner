import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const IndividualAthletePlanning = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: programs, isLoading } = useQuery({
    queryKey: ["programs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleCreateProgram = () => {
    navigate("/individual-athlete/programs/new");
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Chargement des programmes...</p>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs?.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>

      {programs?.length === 0 && (
        <div className="text-center">
          <p className="text-muted-foreground">Aucun programme créé</p>
        </div>
      )}
    </div>
  );
};

export default IndividualAthletePlanning;