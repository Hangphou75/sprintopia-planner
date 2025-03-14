
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface SubscriptionAlertProps {
  isSubscriptionExpired: boolean;
  isAdmin: boolean;
  onUpgrade: () => void;
}

export const SubscriptionAlert = ({ 
  isSubscriptionExpired, 
  isAdmin, 
  onUpgrade 
}: SubscriptionAlertProps) => {
  if (!isSubscriptionExpired || isAdmin) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2 text-red-800">
      <AlertTriangle className="h-4 w-4" />
      <div className="flex-1 text-sm">Votre abonnement a expiré</div>
      <Button size="sm" onClick={onUpgrade}>
        Renouveler
      </Button>
    </div>
  );
};
