
import { useState } from "react";
import { Profile } from "@/types/database";
import { useAthleteMutations } from "@/hooks/useAthleteMutations";
import { toast } from "sonner";

export const useAthleteActions = (userId: string | undefined) => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Profile | null>(null);
  const [selectedView, setSelectedView] = useState<"programs" | "competitions">("programs");
  const { deleteAthleteMutation } = useAthleteMutations();

  const handleDeleteAthlete = (athlete: Profile) => {
    if (!userId) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${athlete.first_name} ${athlete.last_name} ?`)) {
      deleteAthleteMutation.mutate(
        { coachId: userId, athleteId: athlete.id },
        {
          onSuccess: () => {
            setSelectedAthlete(null);
            toast.success(`${athlete.first_name} ${athlete.last_name} a été supprimé(e) avec succès`);
          },
          onError: (error) => {
            console.error("Error deleting athlete:", error);
            toast.error("Erreur lors de la suppression de l'athlète");
          }
        }
      );
    }
  };

  const handleAthleteSelect = (athlete: Profile, view: "programs" | "competitions") => {
    setSelectedAthlete(athlete);
    setSelectedView(view);
  };

  return {
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    isProgramDialogOpen,
    setIsProgramDialogOpen,
    selectedAthlete,
    setSelectedAthlete,
    selectedView,
    setSelectedView,
    handleDeleteAthlete,
    handleAthleteSelect
  };
};
