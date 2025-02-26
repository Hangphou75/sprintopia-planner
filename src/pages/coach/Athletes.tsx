
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Profile } from "@/types/database";
import { useAthletes } from "@/hooks/useAthletes";
import { useAthleteMutations } from "@/hooks/useAthleteMutations";
import { AthletesList } from "@/components/athletes/AthletesList";
import { InviteAthleteDialog } from "@/components/athletes/InviteAthleteDialog";
import { AssignProgramDialog } from "@/components/athletes/AssignProgramDialog";
import { AthleteProgramsSheet } from "@/components/athletes/AthleteProgramsSheet";
import { Plus } from "lucide-react";

const Athletes = () => {
  const { user } = useAuth();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Profile | null>(null);

  const { data: athletes } = useAthletes(user?.id);
  const { deleteAthleteMutation } = useAthleteMutations();

  const handleDeleteAthlete = (athlete: Profile) => {
    if (user?.id && window.confirm(`Êtes-vous sûr de vouloir supprimer ${athlete.first_name} ${athlete.last_name} ?`)) {
      deleteAthleteMutation.mutate(
        { coachId: user.id, athleteId: athlete.id },
        {
          onSuccess: () => setSelectedAthlete(null),
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mes athlètes</h1>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Inviter un athlète
        </Button>
      </div>

      <AthletesList
        athletes={athletes || []}
        onEditAthlete={setSelectedAthlete}
        onDeleteAthlete={handleDeleteAthlete}
      />

      <InviteAthleteDialog
        isOpen={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />

      <AssignProgramDialog
        isOpen={isProgramDialogOpen}
        onOpenChange={setIsProgramDialogOpen}
        selectedAthlete={selectedAthlete}
      />

      <AthleteProgramsSheet
        selectedAthlete={selectedAthlete}
        onOpenChange={setSelectedAthlete}
        onAddProgram={() => setIsProgramDialogOpen(true)}
      />
    </div>
  );
};

export default Athletes;
