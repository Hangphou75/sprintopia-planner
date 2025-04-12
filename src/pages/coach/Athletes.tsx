
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Profile } from "@/types/database";
import { useAthletes } from "@/hooks/useAthletes";
import { useAthleteMutations } from "@/hooks/useAthleteMutations";
import { AthleteTable, AthleteRelation } from "@/components/athletes/AthleteTable";
import { InviteAthleteDialogEnhanced } from "@/components/athletes/InviteAthleteDialog";
import { AssignProgramDialog } from "@/components/athletes/AssignProgramDialog";
import { AthleteProgramsSheet } from "@/components/athletes/AthleteProgramsSheet";
import { AthleteCompetitionsSheet } from "@/components/athletes/AthleteCompetitionsSheet";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AthleteFilters } from "@/components/athletes/AthleteFilters";
import { AthleteLoadingState } from "@/components/athletes/AthleteLoadingState";
import { AthleteAdminFilters } from "@/components/athletes/AthleteAdminFilters";

// Define a coach type to handle the data properly
type CoachInfo = {
  id: string;
  name: string;
};

const Athletes = () => {
  const { user } = useAuth();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Profile | null>(null);
  const [selectedView, setSelectedView] = useState<"programs" | "competitions">("programs");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const isAdmin = user?.role === "admin";

  console.log("Athletes page - user:", user, "isAdmin:", isAdmin);

  const { data: athletesData, isLoading, error } = useAthletes(user?.id);
  const { deleteAthleteMutation } = useAthleteMutations();

  useEffect(() => {
    if (error) {
      console.error("Error fetching athletes:", error);
      toast.error("Erreur lors du chargement des athlètes");
    }
  }, [error]);

  const handleDeleteAthlete = (athlete: Profile) => {
    if (!user?.id) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${athlete.first_name} ${athlete.last_name} ?`)) {
      deleteAthleteMutation.mutate(
        { coachId: user.id, athleteId: athlete.id },
        {
          onSuccess: () => {
            setSelectedAthlete(null);
            toast.success(`${athlete.first_name} ${athlete.last_name} a été supprimé(e) avec succès`);
          },
          onError: (error) => {
            console.error("Error deleting athlete:", error);
            toast.error("Erreur lors de la suppression de l'athlète");
          }
        }
      );
    }
  };

  // Get unique coaches from the data (for admin filtering)
  const coaches: CoachInfo[] = isAdmin && athletesData ? 
    Array.from(new Set(athletesData.map(a => a.coach_id)))
      .map(coachId => {
        const coachRelation = athletesData.find(a => a.coach_id === coachId);
        if (coachRelation?.coach) {
          return {
            id: coachId,
            name: `${coachRelation.coach.first_name} ${coachRelation.coach.last_name}`
          };
        }
        return null;
      })
      .filter((coach): coach is CoachInfo => coach !== null) : [];

  const filteredAthletes = athletesData?.filter(relation => {
    const athlete = relation.athlete;
    // First filter by search text
    const matchesSearch = 
      `${athlete.first_name} ${athlete.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
      athlete.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Then filter by selected coach (admin only)
    const matchesCoach = !isAdmin || !selectedCoach || relation.coach_id === selectedCoach;
    
    return matchesSearch && matchesCoach;
  });

  const sortedAthletes = [...(filteredAthletes || [])].sort((a, b) => {
    const athleteA = a.athlete;
    const athleteB = b.athlete;

    switch (sortBy) {
      case "name":
        return `${athleteA.first_name} ${athleteA.last_name}`.localeCompare(
          `${athleteB.first_name} ${athleteB.last_name}`
        );
      case "email":
        return (athleteA.email || "").localeCompare(athleteB.email || "");
      case "date":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      default:
        return 0;
    }
  });

  const handleAthleteSelect = (athlete: Profile, view: "programs" | "competitions") => {
    setSelectedAthlete(athlete);
    setSelectedView(view);
  };

  const formattedAthletes: AthleteRelation[] = sortedAthletes.map(relation => ({
    id: relation.id,
    athlete: relation.athlete as Profile
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isAdmin ? "Gestion des athlètes (Admin)" : "Mes athlètes"}
        </h1>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Inviter un athlète
        </Button>
      </div>

      {isAdmin && (
        <AthleteAdminFilters
          totalAthletes={athletesData?.length || 0}
          coaches={coaches}
          selectedCoach={selectedCoach}
          onCoachChange={setSelectedCoach}
        />
      )}

      <AthleteFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <AthleteLoadingState isLoading={isLoading} error={error} />

      {!isLoading && !error && formattedAthletes && formattedAthletes.length > 0 ? (
        <AthleteTable
          athletes={formattedAthletes}
          onEditAthlete={(athlete) => handleAthleteSelect(athlete, "programs")}
          onViewCompetitions={(athlete) => handleAthleteSelect(athlete, "competitions")}
          onDeleteAthlete={handleDeleteAthlete}
        />
      ) : !isLoading && !error ? (
        <div className="py-8 text-center border rounded-md">
          <p className="text-muted-foreground">Aucun athlète trouvé</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => setIsInviteDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Inviter un athlète
          </Button>
        </div>
      ) : null}

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
