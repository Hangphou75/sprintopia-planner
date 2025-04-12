
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AthleteTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  totalCount: number;
  pendingInvitesCount?: number;
}

export const AthleteTabs = ({ 
  activeTab, 
  onTabChange,
  totalCount,
  pendingInvitesCount = 0
}: AthleteTabsProps) => {
  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={onTabChange} className="mb-6">
      <TabsList>
        <TabsTrigger value="all">
          Tous ({totalCount})
        </TabsTrigger>
        <TabsTrigger value="active">
          Actifs
        </TabsTrigger>
        {pendingInvitesCount > 0 && (
          <TabsTrigger value="pending">
            Invitations en attente ({pendingInvitesCount})
          </TabsTrigger>
        )}
      </TabsList>
    </Tabs>
  );
};
