import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Timer, Trophy, Dumbbell, Activity, RunningIcon, Zap, Flame } from "lucide-react";
import { CalendarView } from "./calendar/CalendarView";
import { EventDetails } from "./calendar/EventDetails";
import { EventFilters } from "./calendar/EventFilters";
import { Event, ThemeOption } from "./types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

type ProgramWorkoutCalendarProps = {
  workouts: any[];
  competitions: any[];
  programId: string;
};

const themeOptions: ThemeOption[] = [
  { value: "aerobic", label: "Aérobie" },
  { value: "anaerobic-alactic", label: "Anaérobie alactique" },
  { value: "anaerobic-lactic", label: "Anaérobie lactique" },
  { value: "strength", label: "Force" },
  { value: "technical", label: "Technique" },
  { value: "mobility", label: "Mobilité" },
  { value: "plyometric", label: "Pliométrie" },
];

const themeIcons: { [key: string]: any } = {
  "aerobic": RunningIcon,
  "anaerobic-alactic": Zap,
  "anaerobic-lactic": Flame,
  "strength": Dumbbell,
  "technical": Activity,
  "mobility": Activity,
  "plyometric": Activity,
};

export const ProgramWorkoutCalendar = ({
  workouts,
  competitions,
  programId,
}: ProgramWorkoutCalendarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Combine workouts and competitions into events
  const events: Event[] = [
    ...workouts.map((workout) => ({
      id: workout.id,
      title: workout.title,
      date: new Date(workout.date),
      type: "workout" as const,
      theme: workout.theme,
      description: workout.description,
      time: workout.time,
      details: workout.details,
    })),
    ...competitions.map((competition) => ({
      id: competition.id,
      title: competition.name,
      date: new Date(competition.date),
      type: "competition" as const,
      time: competition.time,
    })),
  ];

  // Filter and sort events for the list
  let filteredWorkouts = events.filter(event => event.type === "workout");
  if (selectedTheme) {
    filteredWorkouts = filteredWorkouts.filter((event) => event.theme === selectedTheme);
  }

  filteredWorkouts.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const handleDuplicateWorkout = async (event: Event) => {
    if (event.type !== "workout") return;
    
    try {
      const { data, error } = await supabase
        .from("workouts")
        .insert({
          program_id: programId,
          title: `${event.title} (copie)`,
          description: event.description,
          date: event.date.toISOString(),
          time: event.time,
          theme: event.theme,
          details: event.details,
        })
        .select()
        .single();

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["workouts", programId] });

      toast({
        title: "Séance dupliquée",
        description: "La séance a été dupliquée avec succès.",
      });
    } catch (error) {
      console.error("Error duplicating workout:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la duplication de la séance.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWorkout = async (event: Event) => {
    if (event.type !== "workout") return;
    
    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", event.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["workouts", programId] });

      toast({
        title: "Séance supprimée",
        description: "La séance a été supprimée avec succès.",
      });
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la séance.",
        variant: "destructive",
      });
    }
  };

  const handleEventClick = (event: Event) => {
    if (event.type === "workout") {
      navigate(`/coach/programs/${programId}/workouts/${event.id}/edit`);
    } else {
      navigate(`/coach/programs/${programId}/competitions/${event.id}/edit`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-4">
        <CalendarView
          events={events}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        <EventDetails
          events={events}
          selectedDate={selectedDate}
          themeOptions={themeOptions}
          onEventClick={handleEventClick}
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Liste des séances</h2>
          <EventFilters
            selectedTheme={selectedTheme}
            sortOrder={sortOrder}
            themeOptions={themeOptions}
            onThemeChange={setSelectedTheme}
            onSortOrderChange={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          />
        </div>

        <div className="grid gap-4">
          {filteredWorkouts.map((event) => {
            const Icon = event.theme ? themeIcons[event.theme] || Timer : Timer;
            return (
              <div
                key={event.id}
                className={`p-4 border rounded-lg hover:border-primary transition-colors ${
                  event.theme ? `border-theme-${event.theme}` : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <Icon className={`h-5 w-5 ${
                      event.theme ? `text-theme-${event.theme}` : ''
                    }`} />
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} à {event.time || "Non défini"}
                      </p>
                      {event.theme && (
                        <p className="text-sm">
                          {themeOptions.find(t => t.value === event.theme)?.label}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full"
                      onClick={() => handleDuplicateWorkout(event)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full text-red-500"
                      onClick={() => handleDeleteWorkout(event)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredWorkouts.length === 0 && (
            <p className="text-center text-muted-foreground">Aucune séance créée</p>
          )}
        </div>
      </div>
    </div>
  );
};