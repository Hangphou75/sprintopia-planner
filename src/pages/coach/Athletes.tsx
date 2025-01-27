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

const Athletes = () => {
  const { user } = useAuth();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<Profile | null>(null);

  const { data: athletes } = useAthletes(user?.id);
  const { data: athletePrograms } = useAthletePrograms(selectedAthlete?.id);
  const { inviteMutation, deleteAthleteMutation, deleteProgramMutation } = useAthleteMutations();

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
    if (user?.id && window.confirm("Êtes-vous sûr de vouloir supprimer ce programme ?")) {
      deleteProgramMutation.mutate({ coachId: user.id, programId });
    }
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
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Athletes;