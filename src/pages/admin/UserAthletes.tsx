
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Profile } from "@/types/database";
import { UserProfile } from "@/hooks/useProfile";
import { AthletesList } from "@/components/athletes/AthletesList";

export const UserAthletes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [coach, setCoach] = useState<UserProfile | null>(null);
  const [athletes, setAthletes] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoachAndAthletes = async () => {
      if (!id) return;

      try {
        setLoading(true);
        
        // Récupérer les informations du coach
        const { data: coachData, error: coachError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (coachError) throw coachError;
        setCoach(coachData as UserProfile);

        // Récupérer les athlètes du coach
        const { data: coachAthletesData, error: athletesError } = await supabase
          .from("coach_athletes")
          .select("athlete_id")
          .eq("coach_id", id);

        if (athletesError) throw athletesError;

        if (coachAthletesData.length > 0) {
          const athleteIds = coachAthletesData.map(ca => ca.athlete_id);
          
          // Récupérer les profils des athlètes
          const { data: athletesProfiles, error: profilesError } = await supabase
            .from("profiles")
            .select("*")
            .in("id", athleteIds);

          if (profilesError) throw profilesError;
          setAthletes(athletesProfiles as Profile[]);
        }
      } catch (error) {
        console.error("Error fetching coach and athletes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoachAndAthletes();
  }, [id]);

  // Fonction pour les retours fictifs (pour l'interface admin)
  const handleEditAthlete = (athlete: Profile) => {
    navigate(`/admin/users/${athlete.id}/edit`);
  };

  const handleViewCompetitions = (athlete: Profile) => {
    // Dans un contexte admin, redirigez vers la page des compétitions de l'athlète
    navigate(`/admin/users/${athlete.id}/competitions`);
  };

  const handleDeleteAthlete = (athlete: Profile) => {
    // Dans un contexte admin, on ne veut probablement pas supprimer l'athlète
    // mais juste la relation coach-athlète
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${athlete.first_name} ${athlete.last_name} de la liste des athlètes de ce coach ?`)) {
      // Implémentation à venir
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate("/admin/users")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">
          Athlètes gérés par {coach?.first_name} {coach?.last_name}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des athlètes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Chargement des données...</div>
          ) : (
            <>
              {athletes.length === 0 ? (
                <div className="text-center py-4">Aucun athlète trouvé pour ce coach</div>
              ) : (
                <AthletesList
                  athletes={athletes.map(athlete => ({ id: athlete.id, athlete }))}
                  onEditAthlete={handleEditAthlete}
                  onViewCompetitions={handleViewCompetitions}
                  onDeleteAthlete={handleDeleteAthlete}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAthletes;
