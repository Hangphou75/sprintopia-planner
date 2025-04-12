
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAthletes } from "@/hooks/useAthletes";
import { toast } from "sonner";
import { InviteAthleteDialogEnhanced } from "@/components/athletes/InviteAthleteDialog";
import { AssignProgramDialog } from "@/components/athletes/AssignProgramDialog";
import { AthleteProgramsSheet } from "@/components/athletes/AthleteProgramsSheet";
import { AthleteCompetitionsSheet } from "@/components/athletes/AthleteCompetitionsSheet";
import { AthleteAdminPanel } from "@/components/athletes/admin/AthleteAdminPanel";
import { useAthleteFiltering } from "@/components/athletes/hooks/useAthleteFiltering";
import { useAthleteActions } from "@/components/athletes/hooks/useAthleteActions";
import { AthleteHeader } from "@/components/athletes/AthleteHeader";
import { AthleteContent } from "@/components/athletes/AthleteContent";

const Athletes = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  console.log("Athletes page - user:", user, "isAdmin:", isAdmin);

  // Fetch athletes data
  const { data: athletesData, isLoading, error } = useAthletes(user?.id);

  // Handle athlete filtering and sorting
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedCoach,
    setSelectedCoach,
    coaches,
    sortedAthletes
  } = useAthleteFiltering(athletesData);

  // Handle athlete actions (deletion, selection, etc.)
  const {
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    isProgramDialogOpen,
    setIsProgramDialogOpen,
    selectedAthlete,
    setSelectedAthlete,
    selectedView,
    handleDeleteAthlete,
    handleAthleteSelect
  } = useAthleteActions(user?.id);

  // Error handling
  useEffect(() => {
    if (error) {
      console.error("Error fetching athletes:", error);
      toast.error("Erreur lors du chargement des athlètes");
    }
  }, [error]);

  // Format athletes for the table component
  const formattedAthletes = sortedAthletes.map(relation => ({
    id: relation.id,
    athlete: relation.athlete
  }));

  return (
    <div className="space-y-6">
      <AthleteHeader 
        isAdmin={isAdmin} 
        onInvite={() => setIsInviteDialogOpen(true)} 
      />

      {isAdmin && (
        <AthleteAdminPanel
          totalAthletes={athletesData?.length || 0}
          coaches={coaches}
          selectedCoach={selectedCoach}
          onCoachChange={setSelectedCoach}
        />
      )}

      <AthleteContent
        isLoading={isLoading}
        error={error}
        athletes={formattedAthletes}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onEditAthlete={(athlete) => handleAthleteSelect(athlete, "programs")}
        onViewCompetitions={(athlete) => handleAthleteSelect(athlete, "competitions")}
        onDeleteAthlete={handleDeleteAthlete}
        onInvite={() => setIsInviteDialogOpen(true)}
      />

      {/* Dialogs and sheets */}
      <InviteAthleteDialogEnhanced
        isOpen={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />

      <AssignProgramDialog
        isOpen={isProgramDialogOpen}
        onOpenChange={setIsProgramDialogOpen}
        selectedAthlete={selectedAthlete}
      />

      {selectedView === "programs" && (
        <AthleteProgramsSheet
          selectedAthlete={selectedAthlete}
          onOpenChange={setSelectedAthlete}
          onAddProgram={() => setIsProgramDialogOpen(true)}
        />
      )}

      {selectedView === "competitions" && (
        <AthleteCompetitionsSheet
          selectedAthlete={selectedAthlete}
          onOpenChange={setSelectedAthlete}
        />
      )}
    </div>
  );
};

export default Athletes;
