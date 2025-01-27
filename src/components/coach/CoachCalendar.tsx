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
            )
          )
        `)
        .eq("date", format(selectedDate, "yyyy-MM-dd"))
        .filter("program.athlete.id", "in", `(
          select athlete_id from coach_athletes where coach_id = '${coachId}'
        )`);

      if (error) throw error;
      return data;
    },
    enabled: !!coachId && !!selectedDate,
  });

  const { data: allWorkouts } = useQuery({
    queryKey: ["coach-all-workouts", coachId],
    queryFn: async () => {
      if (!coachId) return [];

      const { data, error } = await supabase
        .from("workouts")
        .select(`
          date,
          program:programs (
            user_id
          )
        `)
        .filter("program.user_id", "in", `(
          select athlete_id from coach_athletes where coach_id = '${coachId}'
        )`);

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
            {workouts?.map((workout) => (
              <div
                key={workout.id}
                className={cn(
                  "rounded-lg border p-4",
                  "hover:border-primary transition-colors"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">
                    {workout.program?.athlete?.first_name} {workout.program?.athlete?.last_name}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {workout.program?.name}
                  </span>
                </div>
                <p className="text-sm font-medium">{workout.title}</p>
                {workout.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {workout.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};