
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Button } from "@/components/ui/button";
import { Plus, Wand2 } from "lucide-react";
import { Program } from "@/types/program";

interface ProgramsListProps {
  programs: Program[] | undefined;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCreateProgram: () => void;
  onGenerateProgram: () => void;
}

export const ProgramsList = ({
  programs,
  onDelete,
  onEdit,
  onDuplicate,
  onCreateProgram,
  onGenerateProgram
}: ProgramsListProps) => {
  if (!programs || programs.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Aucun programme</h2>
        <p className="text-muted-foreground mb-8">
          Vous n'avez pas encore créé de programme d'entraînement.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onGenerateProgram}>
            <Wand2 className="h-4 w-4 mr-2" />
            Générer un programme
          </Button>
          <Button onClick={onCreateProgram}>
            <Plus className="h-4 w-4 mr-2" />
            Créer mon premier programme
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {programs.map((program) => (
        <ProgramCard
          key={program.id}
          program={program}
          onDelete={onDelete}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
};
