
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Button } from "@/components/ui/button";
import { Plus, Wand2 } from "lucide-react";
import { useAthletePrograms } from "@/hooks/useAthletePrograms";

export default function Programs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: programs, isLoading } = useAthletePrograms(user?.id);

  const handleCreateProgram = () => {
    navigate("/individual-athlete/programs/new");
  };

  const handleGenerateProgram = () => {
    navigate("/individual-athlete/programs/generate");
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateProgram}>
            <Wand2 className="h-4 w-4 mr-2" />
            Générer un programme
          </Button>
          <Button onClick={handleCreateProgram}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau programme
          </Button>
        </div>
      </div>

      {programs && programs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Aucun programme</h2>
          <p className="text-muted-foreground mb-8">
            Vous n'avez pas encore créé de programme d'entraînement.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleGenerateProgram}>
              <Wand2 className="h-4 w-4 mr-2" />
              Générer un programme
            </Button>
            <Button onClick={handleCreateProgram}>
              <Plus className="h-4 w-4 mr-2" />
              Créer mon premier programme
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
