
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkoutHeaderProps {
  title: string;
  onBack: () => void;
  onEdit: () => void;
}

export const WorkoutHeader = ({ title, onBack, onEdit }: WorkoutHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <Button onClick={onEdit} size="sm">
        <Edit className="h-4 w-4 mr-2" />
        Modifier
      </Button>
    </div>
  );
};
