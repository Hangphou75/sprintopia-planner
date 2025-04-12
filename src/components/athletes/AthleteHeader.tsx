
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AthleteHeaderProps {
  isAdmin: boolean;
  onInvite: () => void;
}

export const AthleteHeader = ({ isAdmin, onInvite }: AthleteHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">
        {isAdmin ? "Gestion des athlètes (Admin)" : "Mes athlètes"}
      </h1>
      <Button onClick={onInvite}>
        <Plus className="h-4 w-4 mr-2" />
        Inviter un athlète
      </Button>
    </div>
  );
};
