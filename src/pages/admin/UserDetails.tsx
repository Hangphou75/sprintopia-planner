
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

interface UserDetailsProps {
  user: UserProfile;
  onBack: () => void;
}

export const UserDetails = ({ user, onBack }: UserDetailsProps) => {
  const [athleteCount, setAthleteCount] = useState<number | null>(null);
  const [programCount, setProgramCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        
        if (user.role === "coach") {
          // Récupérer le nombre d'athlètes pour ce coach
          const { count: athletesCount, error: athletesError } = await supabase
            .from("coach_athletes")
            .select("*", { count: "exact", head: true })
            .eq("coach_id", user.id);
            
          if (athletesError) throw athletesError;
          setAthleteCount(athletesCount);
        }
        
        // Récupérer le nombre de programmes pour ce user
        if (user.role === "coach" || user.role === "individual_athlete") {
          const { count: programsCount, error: programsError } = await supabase
            .from("programs")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);
            
          if (programsError) throw programsError;
          setProgramCount(programsCount);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user]);

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: "bg-red-500",
      coach: "bg-blue-500",
      athlete: "bg-green-500",
      individual_athlete: "bg-purple-500"
    };
    
    const labels = {
      admin: "Administrateur",
      coach: "Coach",
      athlete: "Athlète",
      individual_athlete: "Athlète Individuel"
    };
    
    const style = styles[role as keyof typeof styles] || "bg-gray-500";
    const label = labels[role as keyof typeof labels] || role;
    
    return <Badge className={style}>{label}</Badge>;
  };

  const getSubscriptionBadge = (tier?: string) => {
    if (!tier) return null;
    
    const styles = {
      premium: "bg-yellow-500",
      standard: "bg-blue-300",
      free: "bg-gray-300 text-gray-700"
    };
    
    const labels = {
      premium: "Premium",
      standard: "Standard",
      free: "Gratuit"
    };
    
    const style = styles[tier as keyof typeof styles] || "bg-gray-500";
    const label = labels[tier as keyof typeof labels] || tier;
    
    return <Badge className={style}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">
          Détails de l'utilisateur
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{user.first_name} {user.last_name}</span>
            <div className="flex space-x-2">
              {getRoleBadge(user.role)}
              {getSubscriptionBadge(user.subscription_tier)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Informations personnelles</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="text-xs">{user.id}</span>
                </div>
                {user.bio && (
                  <div>
                    <span className="text-muted-foreground">Bio:</span>
                    <p className="mt-1 text-sm">{user.bio}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Informations du compte</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rôle:</span>
                  <span>{user.role === "coach" ? "Coach" : 
                          user.role === "athlete" ? "Athlète" : 
                          user.role === "individual_athlete" ? "Athlète Individuel" : 
                          user.role === "admin" ? "Administrateur" : user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Abonnement:</span>
                  <span>{user.subscription_tier === "premium" ? "Premium" : 
                          user.subscription_tier === "standard" ? "Standard" : "Gratuit"}</span>
                </div>
                {user.subscription_expiry && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expiration:</span>
                    <span>{format(new Date(user.subscription_expiry), "dd/MM/yyyy")}</span>
                  </div>
                )}
                {user.role === "coach" && user.max_athletes !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nombre max d'athlètes:</span>
                    <span>{user.max_athletes === null ? "Illimité" : user.max_athletes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Chargement des données...</div>
          ) : (
            <>
              {user.role === "coach" && athleteCount !== null && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Statistiques</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{athleteCount}</div>
                          <div className="text-sm text-muted-foreground">Athlètes</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{programCount}</div>
                          <div className="text-sm text-muted-foreground">Programmes</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {user.role === "individual_athlete" && programCount !== null && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Statistiques</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{programCount}</div>
                          <div className="text-sm text-muted-foreground">Programmes</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
