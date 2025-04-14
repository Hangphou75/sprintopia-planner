
import { Button } from "@/components/ui/button";
import { Settings, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActionButtonsProps {
  programId: string;
  userRole?: string;
  showActionButtons: boolean;
  isMobile?: boolean;
}

export const ActionButtons = ({
  programId,
  userRole,
  showActionButtons,
  isMobile = false
}: ActionButtonsProps) => {
  const navigate = useNavigate();

  // Method for creating a new workout
  const handleNewWorkout = () => {
    // Allow coaches, admins and individual athletes to create workouts
    if (userRole === 'coach' || userRole === 'admin') {
      navigate(`/coach/programs/${programId}/workouts/new`);
    } else if (userRole === 'individual_athlete') {
      navigate(`/individual-athlete/programs/${programId}/workouts/new`);
    }
  };

  // Method for accessing program settings
  const handleProgramSettings = () => {
    // Allow coaches, admins and individual athletes to modify programs
    if (userRole === 'coach' || userRole === 'admin') {
      navigate(`/coach/programs/${programId}/edit`);
    } else if (userRole === 'individual_athlete') {
      navigate(`/individual-athlete/programs/${programId}/edit`);
    }
  };

  if (!showActionButtons) return null;

  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="sm" onClick={handleProgramSettings}>
        <Settings className="h-4 w-4 mr-2" />
        Paramètres
      </Button>
      <Button size="sm" onClick={handleNewWorkout}>
        <Plus className="h-4 w-4 mr-2" />
        Nouvelle séance
      </Button>
    </div>
  );
};
