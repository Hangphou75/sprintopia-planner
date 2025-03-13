
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { Program } from "@/types/program";
import { UserProfile } from "@/hooks/useProfile";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Link } from "react-router-dom";

export const UserPrograms = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndPrograms = async () => {
      if (!id) return;

      try {
        setLoading(true);
        
        // Récupérer les informations de l'utilisateur
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (userError) throw userError;
        setUser(userData as UserProfile);

        // Récupérer les programmes de l'utilisateur
        const { data: programsData, error: programsError } = await supabase
          .from("programs")
          .select("*")
          .eq("user_id", id)
          .order("created_at", { ascending: false });

        if (programsError) throw programsError;
        setPrograms(programsData as Program[]);
      } catch (error) {
        console.error("Error fetching user and programs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPrograms();
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate("/admin/users")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">
          Programmes de {user?.first_name} {user?.last_name}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des programmes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Chargement des données...</div>
          ) : (
            <>
              {programs.length === 0 ? (
                <div className="text-center py-4">Aucun programme trouvé pour cet utilisateur</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {programs.map((program) => (
                    <ProgramCard 
                      key={program.id} 
                      program={program}
                      actions={
                        <Link 
                          to={`/${user?.role === "coach" ? "coach" : "individual-athlete"}/programs/${program.id}/workouts`}
                          target="_blank"
                        >
                          <Button size="sm" variant="secondary">
                            <Calendar className="h-4 w-4 mr-2" />
                            Voir les entraînements
                          </Button>
                        </Link>
                      }
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPrograms;
