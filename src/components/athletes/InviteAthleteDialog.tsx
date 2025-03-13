
// Réimplémentez le composant InviteAthleteDialog avec la vérification des limites
// Ce fichier est en lecture seule, nous allons donc en créer une nouvelle version améliorée

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

  const handleInviteAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) return;
    
    // Vérifier si l'abonnement a expiré
    if (isSubscriptionExpired) {
      toast.error("Votre abonnement a expiré. Veuillez le renouveler pour inviter des athlètes.");
      onOpenChange(false);
      navigate("/coach/profile");
      return;
    }
    
    // Vérifier les limites d'athlètes
    const withinLimits = await checkAthletesLimit();
    if (!withinLimits) {
      onOpenChange(false);
      navigate("/coach/profile");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from("athlete_invitations")
        .insert({
          coach_id: user.id,
          email,
          status: "pending",
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === "23505") {
          // Duplicate key error
          toast.error("Une invitation a déjà été envoyée à cet athlète");
        } else {
          console.error("Error inviting athlete:", error);
          toast.error("Erreur lors de l'invitation de l'athlète");
        }
        return;
      }
      
      toast.success("Invitation envoyée avec succès");
      setEmail("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error inviting athlete:", error);
      toast.error("Erreur lors de l'invitation de l'athlète");
    } finally {
      setIsSubmitting(false);
    }
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Invitation en cours..." : "Inviter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
