
import { Profile } from "@/types/database";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Program } from "@/types/program";
import { useAthleteMutations } from "@/hooks/useAthleteMutations";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, User } from "lucide-react";
import { useAthletes } from "@/hooks/useAthletes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

type ProgramAthletesSheetProps = {
  program: Program | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ProgramAthletesSheet = ({
  program,
  isOpen,
  onOpenChange,
}: ProgramAthletesSheetProps) => {
  const { user } = useAuth();
  const { deleteProgramMutation, assignProgramMutation } = useAthleteMutations();
  const { data: athleteRelations } = useAthletes(user?.id);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("");

  // Filtrer les athlètes qui ne sont pas déjà associés au programme
  const availableAthletes = athleteRelations?.filter(
    (relation) =>
      !program?.shared_programs?.some(
        (shared) => shared.athlete.id === relation.athlete.id
      )
  );

  const handleRemoveAthlete = (athleteId: string) => {
    if (!user?.id || !program?.id) return;
    if (window.confirm("Êtes-vous sûr de vouloir retirer cet athlète du programme ?")) {
      deleteProgramMutation.mutate({ 
        coachId: user.id,
        programId: program.id,
        athleteId: athleteId
      });
    }
  };

  const handleAssignAthlete = () => {
    if (!user?.id || !program?.id || !selectedAthleteId) return;
    assignProgramMutation.mutate({
      coachId: user.id,
      athleteId: selectedAthleteId,
      programId: program.id
    });
    setSelectedAthleteId("");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Athlètes associés</SheetTitle>
          <SheetDescription>{program?.name}</SheetDescription>
        </SheetHeader>
        
        {availableAthletes && availableAthletes.length > 0 && (
          <div className="flex gap-2 items-center mt-6">
            <Select value={selectedAthleteId} onValueChange={setSelectedAthleteId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sélectionner un athlète" />
              </SelectTrigger>
              <SelectContent>
                {availableAthletes.map((relation) => (
                  <SelectItem key={relation.athlete.id} value={relation.athlete.id}>
                    {relation.athlete.first_name} {relation.athlete.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="icon"
              onClick={handleAssignAthlete}
              disabled={!selectedAthleteId}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {program?.shared_programs?.map((relation) => (
            <div
              key={relation.athlete.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {relation.athlete.first_name} {relation.athlete.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {relation.athlete.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveAthlete(relation.athlete.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {!program?.shared_programs?.length && (
            <p className="text-center text-muted-foreground">
              Aucun athlète associé à ce programme
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
