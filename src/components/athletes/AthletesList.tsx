
import { Profile } from "@/types/database";
import { AthleteCard } from "./AthleteCard";

type AthletesListProps = {
  athletes: any[];
  onEditAthlete: (athlete: Profile) => void;
  onDeleteAthlete: (athlete: Profile) => void;
};

export const AthletesList = ({
  athletes,
  onEditAthlete,
  onDeleteAthlete,
}: AthletesListProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {athletes?.map((relation) => (
        <AthleteCard
          key={relation.id}
          athlete={relation.athlete}
          onEdit={onEditAthlete}
          onDelete={onDeleteAthlete}
        />
      ))}
    </div>
  );
};
