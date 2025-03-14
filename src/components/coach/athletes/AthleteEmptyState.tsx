
import { Users } from "lucide-react";
import { memo } from "react";

interface AthleteEmptyStateProps {
  isAdmin: boolean;
}

export const AthleteEmptyState = memo(({ isAdmin }: AthleteEmptyStateProps) => {
  return (
    <div className="text-center py-6">
      <Users className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">
        {isAdmin ? "Aucun athlète dans le système" : "Aucun athlète géré pour le moment"}
      </p>
    </div>
  );
});

AthleteEmptyState.displayName = "AthleteEmptyState";
