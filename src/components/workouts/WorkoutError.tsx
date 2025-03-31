
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface WorkoutErrorProps {
  onBack: () => void;
  title: string;
  message: string;
}

export const WorkoutError = ({ onBack, title, message }: WorkoutErrorProps) => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <p className="text-destructive">{message}</p>
    </div>
  );
};
