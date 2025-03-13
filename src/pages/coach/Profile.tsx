
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { SubscriptionInfo } from "@/components/profile/SubscriptionInfo";
import { UpgradeSubscriptionDialog } from "@/components/profile/UpgradeSubscriptionDialog";
import { useAuth } from "@/contexts/AuthContext";
import { SubscriptionTier } from "@/hooks/useProfile";

const CoachProfile = () => {
  const { user } = useAuth();
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("standard");

  const handleUpgrade = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setIsUpgradeDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mon profil</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>
        
        {user?.role === "coach" && (
          <SubscriptionInfo
            profile={user}
            onUpgrade={handleUpgrade}
          />
        )}
      </div>
      
      <UpgradeSubscriptionDialog
        isOpen={isUpgradeDialogOpen}
        onOpenChange={setIsUpgradeDialogOpen}
        selectedTier={selectedTier}
      />
    </div>
  );
};

export default CoachProfile;
