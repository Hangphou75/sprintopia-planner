import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Timer } from "lucide-react";
import { CalendarView } from "./calendar/CalendarView";
import { EventDetails } from "./calendar/EventDetails";
import { EventFilters } from "./calendar/EventFilters";
import { EventList } from "./calendar/EventList";
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

  const filteredCompetitions = events.filter(event => event.type === "competition");

  // Pagination
  const totalPages = Math.ceil(filteredWorkouts.length / itemsPerPage);
  const paginatedWorkouts = filteredWorkouts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

      // Invalider le cache pour forcer un rechargement des données
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

      // Invalider le cache pour forcer un rechargement des données
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

  const handleViewAllWorkouts = () => {
    navigate(`/coach/programs/${programId}/workouts`);
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

        <EventList
          events={paginatedWorkouts}
          themeOptions={themeOptions}
          currentPage={currentPage}
          totalPages={totalPages}
          onEventClick={handleEventClick}
          onPageChange={setCurrentPage}
          onViewAllClick={handleViewAllWorkouts}
          onDuplicateEvent={handleDuplicateWorkout}
          onDeleteEvent={handleDeleteWorkout}
        />
      </div>
    </div>
  );
};
