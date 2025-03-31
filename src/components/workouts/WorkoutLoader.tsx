
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface WorkoutLoaderProps {
  onBack: () => void;
  title: string;
}

export const WorkoutLoader = ({ onBack, title }: WorkoutLoaderProps) => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};
