import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type CoachCalendarProps = {
  coachId: string | undefined;
};

export const CoachCalendar = ({ coachId }: CoachCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: workouts } = useQuery({
    queryKey: ["coach-workouts", coachId, selectedDate],
    queryFn: async () => {
      if (!coachId || !selectedDate) return [];

      // First, get all athlete IDs for this coach
      const { data: coachAthletes } = await supabase
        .from("coach_athletes")
        .select("athlete_id")
        .eq("coach_id", coachId);

      if (!coachAthletes?.length) return [];

      const athleteIds = coachAthletes.map(row => row.athlete_id);

      // Get workouts for programs owned by athletes and shared programs
      const { data, error } = await supabase
        .from("workouts")
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
        .eq("date", format(selectedDate, "yyyy-MM-dd"))
        .in("program.user_id", athleteIds);

      if (error) throw error;
      console.log("Workouts for date:", data);
      return data;
    },
    enabled: !!coachId && !!selectedDate,
  });

  const { data: allWorkouts } = useQuery({
    queryKey: ["coach-all-workouts", coachId],
    queryFn: async () => {
      if (!coachId) return [];

      // Get all athlete IDs for this coach
      const { data: coachAthletes } = await supabase
        .from("coach_athletes")
        .select("athlete_id")
        .eq("coach_id", coachId);

      if (!coachAthletes?.length) return [];

      const athleteIds = coachAthletes.map(row => row.athlete_id);

      // Get all workouts for these athletes' programs
      const { data, error } = await supabase
        .from("workouts")
        .select(`
          date,
          program:programs (
            user_id,
            shared_programs (
              athlete_id
            )
          )
        `)
        .in("program.user_id", athleteIds);

      if (error) throw error;
      return data;
    },
    enabled: !!coachId,
  });

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const hasWorkouts = workouts?.some(workout => 
        format(new Date(workout.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      );
      if (hasWorkouts) {
        setIsDetailsOpen(true);
      }
    }
  };

  return (
    <div>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        className="rounded-md border"
        locale={fr}
        components={{
          DayContent: ({ date }) => {
            const hasWorkouts = allWorkouts?.some(
              workout => format(new Date(workout.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
            );

            return (
              <div className="relative w-full h-full">
                <div>{date.getDate()}</div>
                {hasWorkouts && (
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                  </div>
                )}
              </div>
            );
          },
        }}
      />

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              Séances du {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: fr })}
            </SheetTitle>
            <SheetDescription>
              Détails des séances prévues pour vos athlètes
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {workouts?.map((workout) => {
              // Combine athletes from program owner and shared programs
              const athletes = [
                workout.program?.athlete,
                ...(workout.program?.shared_programs?.map(sp => sp.athlete) || [])
              ].filter(Boolean);

              return (
                <div
                  key={workout.id}
                  className={cn(
                    "rounded-lg border p-4",
                    "hover:border-primary transition-colors"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="space-y-1">
                      <h3 className="font-semibold">Athlètes :</h3>
                      {athletes.map((athlete) => (
                        <p key={athlete.id} className="text-sm">
                          {athlete.first_name} {athlete.last_name}
                        </p>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {workout.program?.name}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{workout.title}</p>
                    {workout.description && (
                      <p className="text-sm text-muted-foreground">
                        {workout.description}
                      </p>
                    )}
                    {workout.theme && (
                      <p className="text-sm">
                        <span className="font-medium">Type :</span>{" "}
                        <span className="text-muted-foreground">{workout.theme}</span>
                      </p>
                    )}
                    {workout.duration && (
                      <p className="text-sm">
                        <span className="font-medium">Durée :</span>{" "}
                        <span className="text-muted-foreground">{workout.duration}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {(!workouts || workouts.length === 0) && (
              <p className="text-center text-muted-foreground">
                Aucune séance prévue pour ce jour
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};