import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

type CompetitionHeaderProps = {
  isMain: boolean;
  onRemove?: () => void;
};

export const CompetitionHeader = ({ isMain, onRemove }: CompetitionHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      {isMain ? (
        <h3 className="text-lg font-semibold flex items-center">
          <Trophy className="mr-2 h-4 w-4" />
          Compétition principale
        </h3>
      ) : (
        <div className="flex justify-between items-center w-full">
          <h4 className="font-medium">Compétition intermédiaire</h4>
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
            >
              Supprimer
            </Button>
          )}
        </div>
      )}
    </div>
  );
};