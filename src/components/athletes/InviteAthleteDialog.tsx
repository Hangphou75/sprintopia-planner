
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useNavigate } from "react-router-dom";
import { useAthleteMutations } from "@/hooks/useAthleteMutations";

interface InviteAthleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteAthleteDialogEnhanced = ({
  isOpen,
  onOpenChange,
}: InviteAthleteDialogProps) => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { checkAthletesLimit, isSubscriptionExpired } = useSubscriptionLimits();
  const navigate = useNavigate();
  const { inviteMutation } = useAthleteMutations();
  
  const isAdmin = user?.role === "admin";

  const handleInviteAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) return;
    
    // Pour les admins, on bypasse les vérifications de limite et d'abonnement
    if (!isAdmin) {
      // Vérifier si l'abonnement a expiré
      if (isSubscriptionExpired) {
        toast.error("Votre abonnement a expiré. Veuillez le renouveler pour inviter des athlètes.");
        onOpenChange(false);
        navigate("/coach/profile");
        return;
      }
      
      // Vérifier les limites d'athlètes (sauf pour les admins)
      const withinLimits = await checkAthletesLimit();
      if (!withinLimits) {
        onOpenChange(false);
        navigate("/coach/profile");
        return;
      }
    }
    
    setIsSubmitting(true);
    
    inviteMutation.mutate(
      { coachId: user.id, email },
      {
        onSuccess: () => {
          setEmail("");
          onOpenChange(false);
          setIsSubmitting(false);
        },
        onError: () => {
          setIsSubmitting(false);
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inviter un athlète</DialogTitle>
          <DialogDescription>
            Envoyez une invitation par email à un athlète pour qu'il rejoigne votre équipe.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleInviteAthlete}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@example.com"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || inviteMutation.isPending}>
              {isSubmitting || inviteMutation.isPending ? "Invitation en cours..." : "Inviter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
