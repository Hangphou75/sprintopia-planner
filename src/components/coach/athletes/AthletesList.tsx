
import { Profile } from "@/types/database";
import { useNavigate } from "react-router-dom";
import { memo, useCallback } from "react";
import { AthleteEmptyState } from "./AthleteEmptyState";

interface AthletesListProps {
  athletes: { id: string; athlete: { id: string; first_name: string; last_name: string; email: string } }[] | undefined;
  isAdmin: boolean;
}

export const AthletesList = memo(({ athletes, isAdmin }: AthletesListProps) => {
  const navigate = useNavigate();

  const handleAthleteClick = useCallback((athleteId: string) => {
    navigate(`/coach/athletes/${athleteId}`);
  }, [navigate]);

  if (!athletes || athletes.length === 0) {
    return <AthleteEmptyState isAdmin={isAdmin} />;
  }

  return (
    <div className="space-y-2">
      {athletes.map((relation) => (
        <div
          key={relation.id}
          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
          onClick={() => handleAthleteClick(relation.athlete.id)}
        >
          <div>
            <p className="font-medium">
              {relation.athlete.first_name} {relation.athlete.last_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {relation.athlete.email}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
});

AthletesList.displayName = "AthletesList";
