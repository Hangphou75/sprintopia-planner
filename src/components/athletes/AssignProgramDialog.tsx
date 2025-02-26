
import { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAthleteMutations } from "@/hooks/useAthleteMutations";

type AssignProgramDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAthlete: Profile | null;
};

export const AssignProgramDialog = ({
  isOpen,
  onOpenChange,
  selectedAthlete,
}: AssignProgramDialogProps) => {
  const { user } = useAuth();
  const { assignProgramMutation } = useAthleteMutations();

  const { data: availablePrograms } = useQuery({
    queryKey: ["coach-programs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleAssignProgram = (programId: string) => {
    if (!user?.id || !selectedAthlete?.id) return;
    assignProgramMutation.mutate(
      {
        coachId: user.id,
        athleteId: selectedAthlete.id,
        programId: programId,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Associer un programme</DialogTitle>
          <DialogDescription>
            Choisissez un programme à associer à {selectedAthlete?.first_name}{" "}
            {selectedAthlete?.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {availablePrograms?.map((program) => (
            <Button
              key={program.id}
              variant="outline"
              className="justify-start"
              onClick={() => handleAssignProgram(program.id)}
            >
              {program.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
