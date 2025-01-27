import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";

type WeeklyCompetitionsProps = {
  coachId: string | undefined;
};

export const WeeklyCompetitions = ({ coachId }: WeeklyCompetitionsProps) => {
  const { data: competitions } = useQuery({
    queryKey: ["coach-weekly-competitions", coachId],
    queryFn: async () => {
      if (!coachId) return [];

      const start = startOfWeek(new Date(), { weekStartsOn: 1 });
      const end = endOfWeek(new Date(), { weekStartsOn: 1 });

      const { data, error } = await supabase
        .from("competitions")
        .select(`
          *,
          program:programs (
            name,
            user_id,
            athlete:profiles!programs_user_id_fkey (
              id,
              first_name,
              last_name
            )
          )
        `)
        .gte("date", format(start, "yyyy-MM-dd"))
        .lte("date", format(end, "yyyy-MM-dd"))
        .filter("program.athlete.id", "in", `(
          select athlete_id from coach_athletes where coach_id = '${coachId}'
        )`);

      if (error) throw error;
      return data;
    },
    enabled: !!coachId,
  });

  if (!competitions?.length) {
    return (
      <div className="text-center py-6">
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Aucune compétition cette semaine
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {competitions.map((competition) => (
        <div
          key={competition.id}
          className="rounded-lg border p-4 hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <h3 className="font-semibold">{competition.name}</h3>
          </div>
          
          <div className="space-y-1 text-sm">
            <p>
              {format(new Date(competition.date), "d MMMM yyyy", { locale: fr })}
            </p>
            <p className="text-muted-foreground">
              {competition.program?.athlete?.first_name} {competition.program?.athlete?.last_name}
            </p>
            {competition.location && (
              <p className="text-muted-foreground">{competition.location}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};