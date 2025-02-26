import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AthleteCard } from "@/components/athletes/AthleteCard";
import { AthletePrograms } from "@/components/athletes/AthletePrograms";
import { Profile } from "@/types/database";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAthletes } from "@/hooks/useAthletes";
import { useAthletePrograms } from "@/hooks/useAthletePrograms";
import { useAthleteMutations } from "@/hooks/useAthleteMutations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Athletes = () => {
  const { user } = useAuth();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<Profile | null>(null);

  const { data: athletes } = useAthletes(user?.id);
  const { data: athletePrograms } = useAthletePrograms(selectedAthlete?.id);
  const { inviteMutation, deleteAthleteMutation, deleteProgramMutation, assignProgramMutation } = useAthleteMutations();

  // Fetch available programs for the coach
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

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.id) {
      inviteMutation.mutate({ coachId: user.id, email: inviteEmail }, {
        onSuccess: () => {
          setIsInviteDialogOpen(false);
          setInviteEmail("");
        }
      });
    }
  };

  const handleDeleteAthlete = (athlete: Profile) => {
    if (user?.id && window.confirm(`Êtes-vous sûr de vouloir supprimer ${athlete.first_name} ${athlete.last_name} ?`)) {
      deleteAthleteMutation.mutate({ coachId: user.id, athleteId: athlete.id }, {
        onSuccess: () => setSelectedAthlete(null)
      });
    }
  };

  const handleDeleteProgram = (programId: string) => {
    if (!user?.id) return;
    deleteProgramMutation.mutate({ coachId: user.id, programId });
  };

  const handleAssignProgram = (programId: string) => {
    if (!user?.id || !selectedAthlete?.id) return;
    assignProgramMutation.mutate({
      coachId: user.id,
      athleteId: selectedAthlete.id,
      programId: programId,
    }, {
      onSuccess: () => {
        setIsProgramDialogOpen(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mes athlètes</h1>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          Inviter un athlète
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {athletes?.map((relation) => (
          <AthleteCard
            key={relation.id}
            athlete={relation.athlete}
            onEdit={(athlete) => setSelectedAthlete(athlete)}
            onDelete={handleDeleteAthlete}
          />
        ))}
      </div>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inviter un athlète</DialogTitle>
            <DialogDescription>
              Envoyez une invitation à un athlète pour commencer à collaborer
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInvite}>
            <div className="grid gap-4 py-4">
              <Input
                type="email"
                placeholder="Email de l'athlète"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Envoyer l'invitation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Sheet open={!!selectedAthlete} onOpenChange={() => setSelectedAthlete(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {selectedAthlete?.first_name} {selectedAthlete?.last_name}
            </SheetTitle>
            <SheetDescription>
              Programmes de l'athlète
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {athletePrograms && (
              <AthletePrograms
                programs={athletePrograms}
                onDeleteProgram={handleDeleteProgram}
                onAddProgram={() => setIsProgramDialogOpen(true)}
                showAddButton={true}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Associer un programme</DialogTitle>
            <DialogDescription>
              Choisissez un programme à associer à {selectedAthlete?.first_name} {selectedAthlete?.last_name}
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
    </div>
  );
};

export default Athletes;
