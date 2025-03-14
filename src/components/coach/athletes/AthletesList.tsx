
import { Profile } from "@/types/database";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { memo, useCallback } from "react";

interface AthletesListProps {
  athletes: { athlete: { id: string; first_name: string; last_name: string; email: string } }[] | undefined;
  isAdmin: boolean;
}

export const AthletesList = memo(({ athletes, isAdmin }: AthletesListProps) => {
  const navigate = useNavigate();

  const handleAthleteClick = useCallback((athleteId: string) => {
    navigate(`/coach/athletes/${athleteId}`);
  }, [navigate]);

  if (!athletes || athletes.length === 0) {
    return (
      <div className="text-center py-6">
        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {isAdmin ? "Aucun athlète dans le système" : "Aucun athlète géré pour le moment"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {athletes.map((relation) => (
        <div
          key={relation.athlete.id}
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
