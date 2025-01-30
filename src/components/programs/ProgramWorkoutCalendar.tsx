import { useState } from "react";
import { Timer, Trophy, Dumbbell, Activity, Zap, Flame, Settings, Plus } from "lucide-react";
import { CalendarView } from "./calendar/CalendarView";
import { EventDetails } from "./calendar/EventDetails";
import { EventFilters } from "./calendar/EventFilters";
import { WorkoutList } from "./calendar/WorkoutList";
import { ThemeOption } from "./types";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "./hooks/useEvents";
import { useWorkoutActions } from "./hooks/useWorkoutActions";
import { useCalendarNavigation } from "./hooks/useCalendarNavigation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
  "aerobic": Activity,
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const events = useEvents({ workouts, competitions });
  const { handleDuplicateWorkout, handleDeleteWorkout } = useWorkoutActions({
    programId,
    userRole: user?.role,
  });

  const {
    selectedDate,
    handleEventClick,
    handleDateSelect,
  } = useCalendarNavigation({
    programId,
    userRole: user?.role,
  });

  let filteredWorkouts = events.filter(event => event.type === "workout");

  if (selectedTheme) {
    filteredWorkouts = filteredWorkouts.filter((event) => event.theme === selectedTheme);
  }

  filteredWorkouts.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const basePath = user?.role === 'coach' ? '/coach' : '/individual-athlete';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Séances</h1>
        {(user?.role === 'coach' || user?.role === 'individual_athlete') && (
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={() => navigate(`${basePath}/programs/${programId}/edit`)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Paramètres du programme
            </Button>
            <Button onClick={() => navigate(`${basePath}/programs/${programId}/workouts/new`)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle séance
            </Button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <CalendarView
          events={events}
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
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

        <WorkoutList
          filteredWorkouts={filteredWorkouts}
          themeOptions={themeOptions}
          themeIcons={themeIcons}
          onEventClick={handleEventClick}
          onDuplicateWorkout={handleDuplicateWorkout}
          onDeleteWorkout={handleDeleteWorkout}
          userRole={user?.role}
        />
      </div>
    </div>
  );
};