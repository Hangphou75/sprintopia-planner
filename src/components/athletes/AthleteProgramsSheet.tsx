
import { Profile } from "@/types/database";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AthletePrograms } from "./AthletePrograms";
import { useAthletePrograms } from "@/hooks/useAthletePrograms";
import { useAthleteMutations } from "@/hooks/useAthleteMutations";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";

type AthleteProgramsSheetProps = {
  selectedAthlete: Profile | null;
  onOpenChange: (athlete: Profile | null) => void;
  onAddProgram: () => void;
};

export const AthleteProgramsSheet = ({
  selectedAthlete,
  onOpenChange,
  onAddProgram,
}: AthleteProgramsSheetProps) => {
  const { user } = useAuth();
  const { data: athletePrograms, isLoading, error } = useAthletePrograms(selectedAthlete?.id);
  const { deleteProgramMutation } = useAthleteMutations();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Update isOpen state when selectedAthlete changes
    setIsOpen(!!selectedAthlete);
  }, [selectedAthlete]);

  useEffect(() => {
    // Handle errors
    if (error) {
      console.error("Error loading athlete programs:", error);
      toast.error("Erreur lors du chargement des programmes");
    }
  }, [error]);

  const handleDeleteProgram = (programId: string) => {
    if (!selectedAthlete?.id || !user?.id) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir retirer ce programme ?")) {
      deleteProgramMutation.mutate(
        { 
          coachId: user.id, 
          programId, 
          athleteId: selectedAthlete.id 
        },
        {
          onSuccess: () => {
            toast.success("Programme retiré avec succès");
          },
          onError: (error) => {
            console.error("Error deleting program:", error);
            toast.error("Erreur lors de la suppression du programme");
          }
        }
      );
    }
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      onOpenChange(null);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {selectedAthlete?.first_name} {selectedAthlete?.last_name}
          </SheetTitle>
          <SheetDescription>Programmes de l'athlète</SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement des programmes...</p>
          ) : error ? (
            <p className="text-sm text-destructive">Erreur lors du chargement des programmes</p>
          ) : (
            <AthletePrograms
              programs={athletePrograms || []}
              onDeleteProgram={handleDeleteProgram}
              onAddProgram={onAddProgram}
              showAddButton={true}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
