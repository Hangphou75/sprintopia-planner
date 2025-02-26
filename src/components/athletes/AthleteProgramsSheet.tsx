
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

type AthleteProgramsSheetProps = {
  selectedAthlete: Profile | null;
  onOpenChange: (open: boolean) => void;
  onAddProgram: () => void;
};

export const AthleteProgramsSheet = ({
  selectedAthlete,
  onOpenChange,
  onAddProgram,
}: AthleteProgramsSheetProps) => {
  const { data: athletePrograms } = useAthletePrograms(selectedAthlete?.id);
  const { deleteProgramMutation } = useAthleteMutations();

  const handleDeleteProgram = (programId: string) => {
    if (!selectedAthlete?.id) return;
    deleteProgramMutation.mutate({ coachId: selectedAthlete.id, programId });
  };

  return (
    <Sheet open={!!selectedAthlete} onOpenChange={() => onOpenChange(null)}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {selectedAthlete?.first_name} {selectedAthlete?.last_name}
          </SheetTitle>
          <SheetDescription>Programmes de l'athlète</SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          {athletePrograms && (
            <AthletePrograms
              programs={athletePrograms}
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
