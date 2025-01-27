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

      // Get all athlete IDs for this coach
      const { data: coachAthletes } = await supabase
        .from("coach_athletes")
        .select("athlete_id")
        .eq("coach_id", coachId);

      if (!coachAthletes?.length) return [];

      const athleteIds = coachAthletes.map(row => row.athlete_id);

      // Get all competitions for these athletes
      const { data: competitionsData, error } = await supabase
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
            ),
            shared_programs (
              athlete:profiles!shared_programs_athlete_id_fkey (
                id,
                first_name,
                last_name
              )
            )
          )
        `)
        .gte("date", format(start, "yyyy-MM-dd"))
        .lte("date", format(end, "yyyy-MM-dd"))
        .in("program.user_id", athleteIds);

      if (error) throw error;
      console.log("Weekly competitions:", competitionsData);
      return competitionsData || [];
    },
  });

  const getAthletes = (competition: any) => {
    const athletes = [];
    
    // Add program owner if they exist
    if (competition.program?.athlete) {
      athletes.push(competition.program.athlete);
    }
    
    // Add shared program athletes if they exist
    if (competition.program?.shared_programs) {
      athletes.push(...competition.program.shared_programs.map((sp: any) => sp.athlete));
    }
    
    return athletes;
  };

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
          
          <div className="space-y-2 text-sm">
            <p className="font-medium">
              {format(new Date(competition.date), "d MMMM yyyy", { locale: fr })}
            </p>
            <div>
              <span className="font-medium">Athlètes :</span>
              {getAthletes(competition).map((athlete: any) => (
                <p key={athlete.id} className="text-muted-foreground pl-2">
                  {athlete.first_name} {athlete.last_name}
                </p>
              ))}
            </div>
            {competition.location && (
              <p className="text-muted-foreground">
                <span className="font-medium">Lieu :</span> {competition.location}
              </p>
            )}
            {competition.distance && (
              <p className="text-muted-foreground">
                <span className="font-medium">Distance :</span> {competition.distance}m
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};