
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SubscriptionTier } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { addMonths } from "date-fns";

interface UpgradeSubscriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTier: SubscriptionTier;
}

export const UpgradeSubscriptionDialog = ({
  isOpen,
  onOpenChange,
  selectedTier,
}: UpgradeSubscriptionDialogProps) => {
  const { user } = useAuth();
  const [duration, setDuration] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prix fictifs - à remplacer par vos vrais prix
  const prices = {
    standard: {
      "1": 9.99,
      "3": 26.99,
      "12": 99.99,
    },
    premium: {
      "1": 19.99,
      "3": 53.99,
      "12": 199.99,
    },
  };

  const currentPrice = selectedTier === "standard" 
    ? prices.standard[duration as keyof typeof prices.standard]
    : prices.premium[duration as keyof typeof prices.premium];

  const handleUpgrade = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulons un processus de paiement réussi
      // Dans une vraie implémentation, intégrer Stripe ou un autre processeur de paiement
      console.log(`Upgrading to ${selectedTier} for ${duration} months`);
      
      // Calcul de la nouvelle date d'expiration
      const expiryDate = addMonths(new Date(), parseInt(duration));
      
      // Calcul des limites selon le niveau d'abonnement
      const maxAthletes = selectedTier === "standard" ? 20 : null; // null = illimité pour premium
      
      // Mise à jour du profil avec le nouvel abonnement
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_tier: selectedTier,
          subscription_expiry: expiryDate.toISOString(),
          max_athletes: maxAthletes,
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast.success(`Félicitations ! Votre abonnement a été mis à niveau vers ${selectedTier}`);
      onOpenChange(false);
      
      // Rafraîchissez les données du profil
      window.location.reload();
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      toast.error("Une erreur est survenue lors de la mise à niveau de votre abonnement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Passer à l'abonnement {selectedTier}</DialogTitle>
          <DialogDescription>
            Choisissez la durée de votre abonnement.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={duration}
            onValueChange={setDuration}
            className="space-y-3"
          >
            <div className="flex items-center justify-between border p-3 rounded-md">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="1-month" />
                <Label htmlFor="1-month">1 mois</Label>
              </div>
              <div className="text-right font-medium">
                {selectedTier === "standard" ? prices.standard["1"] : prices.premium["1"]}€ / mois
              </div>
            </div>
            
            <div className="flex items-center justify-between border p-3 rounded-md">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="3-month" />
                <Label htmlFor="3-month">3 mois</Label>
              </div>
              <div className="text-right">
                <span className="font-medium">
                  {selectedTier === "standard" ? prices.standard["3"] : prices.premium["3"]}€
                </span>
                <span className="text-xs ml-1 text-muted-foreground">
                  ({(selectedTier === "standard" ? prices.standard["3"] : prices.premium["3"] / 3).toFixed(2)}€ / mois)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between border p-3 rounded-md relative">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="12" id="12-month" />
                <Label htmlFor="12-month">12 mois</Label>
              </div>
              <div className="text-right">
                <span className="font-medium">
                  {selectedTier === "standard" ? prices.standard["12"] : prices.premium["12"]}€
                </span>
                <span className="text-xs ml-1 text-muted-foreground">
                  ({(selectedTier === "standard" ? prices.standard["12"] : prices.premium["12"] / 12).toFixed(2)}€ / mois)
                </span>
              </div>
              <span className="absolute -top-2 right-3 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                -15%
              </span>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleUpgrade} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Traitement..." : `Payer ${currentPrice}€`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
