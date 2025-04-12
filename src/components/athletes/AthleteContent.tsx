
import { Profile } from "@/types/database";
import { AthleteFilters } from "@/components/athletes/AthleteFilters";
import { AthleteTable, AthleteRelation } from "@/components/athletes/AthleteTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AthleteLoadingState } from "@/components/athletes/AthleteLoadingState";
import { AthleteTabs } from "./AthleteTabs";
import { Card, CardContent } from "@/components/ui/card";

interface AthleteContentProps {
  isLoading: boolean;
  error: unknown;
  athletes: AthleteRelation[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onEditAthlete: (athlete: Profile) => void;
  onViewCompetitions: (athlete: Profile) => void;
  onDeleteAthlete: (athlete: Profile) => void;
  onInvite: () => void;
  activeTab: string;
  onTabChange: (value: string) => void;
  pendingInvitesCount: number;
}

export const AthleteContent = ({
  isLoading,
  error,
  athletes,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onEditAthlete,
  onViewCompetitions,
  onDeleteAthlete,
  onInvite,
  activeTab,
  onTabChange,
  pendingInvitesCount
}: AthleteContentProps) => {
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <AthleteTabs 
          activeTab={activeTab}
          onTabChange={onTabChange}
          totalCount={athletes.length}
          pendingInvitesCount={pendingInvitesCount}
        />

        <AthleteFilters
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          sortBy={sortBy}
          onSortChange={onSortChange}
        />

        <AthleteLoadingState isLoading={isLoading} error={error} />

        {!isLoading && !error && athletes && athletes.length > 0 ? (
          <AthleteTable
            athletes={athletes}
            onEditAthlete={onEditAthlete}
            onViewCompetitions={onViewCompetitions}
            onDeleteAthlete={onDeleteAthlete}
          />
        ) : !isLoading && !error ? (
          <div className="py-8 text-center border rounded-md">
            <p className="text-muted-foreground">Aucun athlète trouvé</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={onInvite}
            >
              <Plus className="h-4 w-4 mr-2" />
              Inviter un athlète
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
