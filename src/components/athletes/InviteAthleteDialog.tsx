
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
import { useAthleteMutations } from "@/hooks/useAthleteMutations";

type InviteAthleteDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export const InviteAthleteDialog = ({
  isOpen,
  onOpenChange,
}: InviteAthleteDialogProps) => {
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState("");
  const { inviteMutation } = useAthleteMutations();

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.id) {
      inviteMutation.mutate(
        { coachId: user.id, email: inviteEmail },
        {
          onSuccess: () => {
            onOpenChange(false);
            setInviteEmail("");
          },
        }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
  );
};
