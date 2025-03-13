
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserProfile, SubscriptionTier } from "@/hooks/useProfile";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { Crown, Check, AlertCircle } from "lucide-react";

interface SubscriptionInfoProps {
  profile: UserProfile;
  onUpgrade: (tier: SubscriptionTier) => void;
}

export const SubscriptionInfo = ({ profile, onUpgrade }: SubscriptionInfoProps) => {
  const { subscription_tier, subscription_expiry, max_athletes } = profile;
  
  const formatExpiryDate = () => {
    if (!subscription_expiry) return null;
    
    const expiryDate = new Date(subscription_expiry);
    const now = new Date();
    
    if (expiryDate < now) {
      return <span className="text-red-500">Expiré</span>;
    }
    
    return (
      <span>
        Expire dans {formatDistance(expiryDate, now, { locale: fr })}
      </span>
    );
  };
  
  const getTierBadge = (tier: SubscriptionTier) => {
    switch (tier) {
      case "free":
        return <Badge variant="outline">Gratuit</Badge>;
      case "standard":
        return <Badge variant="secondary">Standard</Badge>;
      case "premium":
        return <Badge variant="default" className="bg-amber-500">Premium</Badge>;
      default:
        return null;
    }
  };

  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case "free":
        return null;
      case "standard":
        return <Crown className="h-4 w-4 text-blue-500" />;
      case "premium":
        return <Crown className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const renderFeatures = () => {
    return (
      <div className="mt-4 space-y-2">
        <h4 className="font-medium">Fonctionnalités de votre abonnement :</h4>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Nombre d'athlètes : {max_athletes === null ? 'Illimité' : max_athletes}</span>
          </li>
          
          {subscription_tier === "standard" || subscription_tier === "premium" ? (
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Création de programmes personnalisés</span>
            </li>
          ) : (
            <li className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Création de programmes personnalisés (Standard+)</span>
            </li>
          )}
          
          {subscription_tier === "premium" ? (
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Analyses avancées des performances</span>
            </li>
          ) : (
            <li className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Analyses avancées des performances (Premium)</span>
            </li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Abonnement</CardTitle>
            <CardDescription>Votre formule actuelle</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getTierIcon(subscription_tier || "free")}
            {getTierBadge(subscription_tier || "free")}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subscription_expiry && (
            <div className="text-sm text-muted-foreground">
              {formatExpiryDate()}
            </div>
          )}
          
          {renderFeatures()}
          
          <div className="flex flex-col gap-2 mt-6">
            {subscription_tier !== "standard" && (
              <Button 
                variant="outline" 
                onClick={() => onUpgrade("standard")}
                className="w-full"
              >
                Passer à Standard
              </Button>
            )}
            
            {subscription_tier !== "premium" && (
              <Button 
                onClick={() => onUpgrade("premium")}
                className="w-full"
              >
                Passer à Premium
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
