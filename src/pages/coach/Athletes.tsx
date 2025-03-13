
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Profile } from "@/types/database";
import { useAthletes } from "@/hooks/useAthletes";
import { useAthleteMutations } from "@/hooks/useAthleteMutations";
import { AthletesList } from "@/components/athletes/AthletesList";
import { InviteAthleteDialogEnhanced } from "@/components/athletes/InviteAthleteDialog";
import { AssignProgramDialog } from "@/components/athletes/AssignProgramDialog";
import { AthleteProgramsSheet } from "@/components/athletes/AthleteProgramsSheet";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const Athletes = () => {
  const { user } = useAuth();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Profile | null>(null);

  // Ensure we're using the user ID correctly
  const { data: athletes, isLoading, error } = useAthletes(user?.id);
  const { deleteAthleteMutation } = useAthleteMutations();

  // Log data for debugging
  console.log("Athletes page - user:", user);
  console.log("Athletes page - fetched athletes:", athletes);
  
  if (error) {
    console.error("Error in Athletes component:", error);
    toast.error("Erreur lors du chargement des athlètes");
  }

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

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des athlètes...</p>
        </div>
      ) : (
        <AthletesList
          athletes={athletes || []}
          onEditAthlete={setSelectedAthlete}
          onDeleteAthlete={handleDeleteAthlete}
        />
      )}

      <InviteAthleteDialogEnhanced
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
