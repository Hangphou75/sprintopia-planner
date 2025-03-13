
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Users, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useAuth } from "@/contexts/AuthContext";

type ManagedAthletesProps = {
  coachId: string | undefined;
};

export const ManagedAthletes = ({ coachId }: ManagedAthletesProps) => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const pageSize = 5;
  const { isSubscriptionExpired } = useSubscriptionLimits();
  const { user } = useAuth();
  const [usageInfo, setUsageInfo] = useState<{
    current: number;
    limit: number | null;
  } | null>(null);
  
  // Vérifier si l'utilisateur est admin pour gérer différents cas
  const isAdmin = user?.role === "admin";

  const { data } = useQuery({
    queryKey: ["coach-athletes", coachId, page],
    queryFn: async () => {
      if (!coachId) return { athletes: [], count: 0 };

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: athletes, error: athletesError } = await supabase
        .from("coach_athletes")
        .select(`
          athlete:profiles!coach_athletes_athlete_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq("coach_id", coachId)
        .range(from, to);

      const { count, error: countError } = await supabase
        .from("coach_athletes")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", coachId);

      if (athletesError || countError) throw athletesError || countError;
      
      // Mettre à jour les informations d'utilisation
      if (count !== null && user?.max_athletes !== undefined) {
        setUsageInfo({
          current: count,
          limit: isAdmin ? null : user.max_athletes // Les admins n'ont pas de limite
        });
      }
      
      return { athletes, count };
    },
    enabled: !!coachId,
  });

  const totalPages = Math.ceil((data?.count || 0) / pageSize);

  const handleUpgradeClick = () => {
    navigate("/coach/profile");
  };

  // Fonction pour rendre la barre de progression d'utilisation
  const renderUsageBar = () => {
    if (!usageInfo || usageInfo.limit === null) return null;
    
    const percentage = (usageInfo.current / usageInfo.limit) * 100;
    const isNearLimit = percentage >= 80;
    
    return (
      <div className="mt-2 space-y-1">
        <div className="flex justify-between text-xs">
          <span>{usageInfo.current} / {usageInfo.limit} athlètes</span>
          {isNearLimit && (
            <span className="text-amber-600 font-medium">Limite proche</span>
          )}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${isNearLimit ? 'bg-amber-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {isSubscriptionExpired && !isAdmin && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <div className="flex-1 text-sm">Votre abonnement a expiré</div>
          <Button size="sm" onClick={handleUpgradeClick}>
            Renouveler
          </Button>
        </div>
      )}
      
      {usageInfo && usageInfo.limit !== null && renderUsageBar()}
      
      {data?.athletes.length === 0 ? (
        <div className="text-center py-6">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Aucun athlète géré pour le moment
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data?.athletes.map((relation) => (
              <div
                key={relation.athlete.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate(`/coach/athletes/${relation.athlete.id}`)}
              >
                <div>
                  <p className="font-medium">
                    {relation.athlete.first_name} {relation.athlete.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {relation.athlete.email}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
