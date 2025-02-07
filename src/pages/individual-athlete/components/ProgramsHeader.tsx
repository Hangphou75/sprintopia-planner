
import { Button } from "@/components/ui/button";
import { Plus, Wand2 } from "lucide-react";

interface ProgramsHeaderProps {
  onCreateProgram: () => void;
  onGenerateProgram: () => void;
}

export const ProgramsHeader = ({ onCreateProgram, onGenerateProgram }: ProgramsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Mes programmes</h1>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onGenerateProgram}>
          <Wand2 className="h-4 w-4 mr-2" />
          Générer un programme
        </Button>
        <Button onClick={onCreateProgram}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau programme
        </Button>
      </div>
    </div>
  );
};
