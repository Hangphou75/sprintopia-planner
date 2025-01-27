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
import { format, startOfDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

type CoachCalendarProps = {
  coachId: string | undefined;
};

export const CoachCalendar = ({ coachId }: CoachCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const navigate = useNavigate();

  const { data: workouts, isLoading: isLoadingWorkouts } = useQuery({
    queryKey: ["coach-workouts", coachId, selectedDate],
    queryFn: async () => {
      if (!coachId || !selectedDate) return [];

      const formattedDate = format(startOfDay(selectedDate), "yyyy-MM-dd");
      console.log("Fetching workouts for date:", formattedDate);

      // First get all athlete IDs for this coach
      const { data: coachAthletes, error: athletesError } = await supabase
        .from("coach_athletes")
        .select("athlete_id")
        .eq("coach_id", coachId);

      if (athletesError) {
        console.error("Error fetching athletes:", athletesError);
        return [];
      }

      console.log("Coach athletes:", coachAthletes);

      if (!coachAthletes?.length) return [];

      const athleteIds = coachAthletes.map(row => row.athlete_id);

      // Get workouts from programs owned by athletes
      const { data: directWorkouts, error: directError } = await supabase
        .from("workouts")
        .select(`
          *,
          program:programs (
            id,
            name,
            user_id,
            athlete:profiles!programs_user_id_fkey (
              id,
              first_name,
              last_name
            )
          )
        `)
        .gte('date', `${formattedDate}T00:00:00`)
        .lt('date', `${formattedDate}T23:59:59`)
        .in("program.user_id", athleteIds);

      if (directError) {
        console.error("Error fetching direct workouts:", directError);
        return [];
      }

      console.log("Direct workouts:", directWorkouts);

      // Get shared programs
      const { data: sharedPrograms, error: sharedError } = await supabase
        .from("shared_programs")
        .select("program_id")
        .in("athlete_id", athleteIds);

      if (sharedError) {
        console.error("Error fetching shared programs:", sharedError);
        return directWorkouts || [];
      }

      console.log("Shared programs:", sharedPrograms);

      if (!sharedPrograms?.length) {
        return directWorkouts || [];
      }

      // Remove duplicates from program IDs
      const programIds = [...new Set(sharedPrograms.map(sp => sp.program_id))];
      console.log("Program IDs:", programIds);

      // Get workouts from shared programs for the specific date
      const { data: sharedWorkouts, error: workoutsError } = await supabase
        .from("workouts")
        .select(`
          *,
          program:programs (
            id,
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
        .in("program_id", programIds)
        .gte('date', `${formattedDate}T00:00:00`)
        .lt('date', `${formattedDate}T23:59:59`);

      if (workoutsError) {
        console.error("Error fetching workouts from shared programs:", workoutsError);
        return directWorkouts || [];
      }

      console.log("Shared workouts:", sharedWorkouts);

      const allWorkoutsResult = [...(directWorkouts || []), ...(sharedWorkouts || [])];
      console.log("All workouts:", allWorkoutsResult);
      return allWorkoutsResult;
    },
    enabled: !!coachId && !!selectedDate,
  });

  const { data: allWorkouts } = useQuery({
    queryKey: ["coach-all-workouts", coachId],
    queryFn: async () => {
      if (!coachId) return [];

      const { data: coachAthletes } = await supabase
        .from("coach_athletes")
        .select("athlete_id")
        .eq("coach_id", coachId);

      if (!coachAthletes?.length) return [];

      const athleteIds = coachAthletes.map(row => row.athlete_id);

      // Get all workouts for direct programs
      const { data: directWorkouts } = await supabase
        .from("workouts")
        .select(`
          date,
          program:programs (
            user_id
          )
        `)
        .in("program.user_id", athleteIds);

      // Get shared programs IDs first
      const { data: sharedPrograms } = await supabase
        .from("shared_programs")
        .select("program_id")
        .in("athlete_id", athleteIds);

      if (!sharedPrograms?.length) {
        return directWorkouts || [];
      }

      // Remove duplicates from program IDs
      const programIds = [...new Set(sharedPrograms.map(sp => sp.program_id))];

      // Get all workouts for shared programs
      const { data: sharedWorkouts } = await supabase
        .from("workouts")
        .select(`
          date,
          program:programs (
            user_id
          )
        `)
        .in("program_id", programIds);

      return [...(directWorkouts || []), ...(sharedWorkouts || [])];
    },
    enabled: !!coachId,
  });

  const handleDateSelect = (date: Date | undefined) => {
    console.log("Selected date:", date);
    setSelectedDate(date);
    if (date) {
      setIsDetailsOpen(true);
    }
  };

  const handleEditWorkout = (programId: string, workoutId: string) => {
    navigate(`/coach/programs/${programId}/workouts/${workoutId}/edit`);
  };

  const getAthletes = (workout: any) => {
    const athletes = [];
    
    // Add program owner if they exist
    if (workout.program?.athlete) {
      athletes.push(workout.program.athlete);
    }
    
    // Add shared program athletes if they exist
    if (workout.program?.shared_programs) {
      workout.program.shared_programs.forEach((sp: any) => {
        if (sp.athlete) {
          athletes.push(sp.athlete);
        }
      });
    }
    
    return athletes;
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
              workout => {
                const workoutDate = startOfDay(parseISO(workout.date));
                const currentDate = startOfDay(date);
                return workoutDate.getTime() === currentDate.getTime();
              }
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
              {selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
            </SheetTitle>
            <SheetDescription>
              Séances prévues pour vos athlètes
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {isLoadingWorkouts ? (
              <p>Chargement des séances...</p>
            ) : workouts && workouts.length > 0 ? (
              workouts.map((workout) => (
                <Card key={workout.id} className="border-l-4 border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        {workout.title}
                        {workout.theme && (
                          <Badge variant="outline" className={cn("border-theme-" + workout.theme)}>
                            {workout.theme}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditWorkout(workout.program.id, workout.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Athlètes :</div>
                      {getAthletes(workout).map((athlete: any) => (
                        <div key={athlete.id} className="text-sm text-muted-foreground">
                          {athlete.first_name} {athlete.last_name}
                        </div>
                      ))}
                      {workout.description && (
                        <p className="text-sm text-muted-foreground mt-2">{workout.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">Aucune séance prévue ce jour</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
