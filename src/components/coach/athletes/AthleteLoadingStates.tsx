
import { Users } from "lucide-react";

interface AthleteLoadingStatesProps {
  isLoading: boolean;
  error: unknown;
}

export const AthleteLoadingStates = ({ isLoading, error }: AthleteLoadingStatesProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Chargement des athlètes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">Erreur lors du chargement des athlètes</p>
        <p className="text-sm text-muted-foreground">{String(error)}</p>
      </div>
    );
  }

  return null;
};
