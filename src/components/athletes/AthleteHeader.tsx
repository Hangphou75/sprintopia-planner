
import { Button } from "@/components/ui/button";
import { Plus, UserRound } from "lucide-react";

interface AthleteHeaderProps {
  isAdmin: boolean;
  onInvite: () => void;
  totalAthletes: number;
}

export const AthleteHeader = ({ isAdmin, onInvite, totalAthletes }: AthleteHeaderProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isAdmin ? "Gestion des athlètes (Admin)" : "Gestion de mes athlètes"}
        </h1>
        <Button onClick={onInvite}>
          <Plus className="h-4 w-4 mr-2" />
          Inviter un athlète
        </Button>
      </div>
      
      <div className="flex items-center text-muted-foreground">
        <UserRound className="h-5 w-5 mr-2" />
        <span>Total : {totalAthletes} athlète{totalAthletes > 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};
