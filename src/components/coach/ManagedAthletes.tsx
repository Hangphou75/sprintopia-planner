import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ManagedAthletesProps = {
  coachId: string | undefined;
};

export const ManagedAthletes = ({ coachId }: ManagedAthletesProps) => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const pageSize = 5;

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
      return { athletes, count };
    },
    enabled: !!coachId,
  });

  const totalPages = Math.ceil((data?.count || 0) / pageSize);

  return (
    <div className="space-y-4">
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