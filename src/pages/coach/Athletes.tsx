
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Profile } from "@/types/database";
import { useAthletes } from "@/hooks/useAthletes";
import { useAthleteMutations } from "@/hooks/useAthleteMutations";
import { AthletesList, AthleteRelation } from "@/components/athletes/AthletesList";
import { InviteAthleteDialogEnhanced } from "@/components/athletes/InviteAthleteDialog";
import { AssignProgramDialog } from "@/components/athletes/AssignProgramDialog";
import { AthleteProgramsSheet } from "@/components/athletes/AthleteProgramsSheet";
import { AthleteCompetitionsSheet } from "@/components/athletes/AthleteCompetitionsSheet";
import { Plus, Filter, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Athletes = () => {
  const { user } = useAuth();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Profile | null>(null);
  const [selectedView, setSelectedView] = useState<"programs" | "competitions">("programs");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const isAdmin = user?.role === "admin";

  console.log("Athletes page - user:", user, "isAdmin:", isAdmin);

  // Ensure we're using the user ID correctly
  const { data: athletes, isLoading, error } = useAthletes(user?.id);
  const { deleteAthleteMutation } = useAthleteMutations();

  // Log data for debugging
  console.log("Athletes page - fetched athletes:", athletes);
  
  useEffect(() => {
    if (error) {
      console.error("Error in Athletes component:", error);
      toast.error("Erreur lors du chargement des athlètes");
    }
  }, [error]);

  const handleDeleteAthlete = (athlete: Profile) => {
    if (user?.id && window.confirm(`Êtes-vous sûr de vouloir supprimer ${athlete.first_name} ${athlete.last_name} ?`)) {
      deleteAthleteMutation.mutate(
        { coachId: user.id, athleteId: athlete.id },
        {
          onSuccess: () => setSelectedAthlete(null),
        }
      );
    }
  };

  const filteredAthletes = athletes?.filter(relation => {
    const athlete = relation.athlete;
    const fullName = `${athlete.first_name} ${athlete.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           athlete.email?.toLowerCase().includes(searchQuery.toLowerCase());
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

  // Convert the athletes data to match the AthleteRelation type
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

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un athlète..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nom</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="date">Date d'ajout</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des athlètes...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-red-500">Une erreur est survenue lors du chargement des athlètes</p>
          <p className="mt-2 text-muted-foreground">{String(error)}</p>
        </div>
      ) : formattedAthletes && formattedAthletes.length > 0 ? (
        <AthletesList
          athletes={formattedAthletes}
          onEditAthlete={(athlete) => handleAthleteSelect(athlete, "programs")}
          onViewCompetitions={(athlete) => handleAthleteSelect(athlete, "competitions")}
          onDeleteAthlete={handleDeleteAthlete}
        />
      ) : (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Aucun athlète trouvé</p>
        </div>
      )}

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
