import { useState } from "react";
import { Timer, Trophy, Dumbbell, Activity, Zap, Flame } from "lucide-react";
import { CalendarView } from "./calendar/CalendarView";
import { EventDetails } from "./calendar/EventDetails";
import { EventFilters } from "./calendar/EventFilters";
import { ThemeOption } from "./types";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "./hooks/useEvents";
import { useWorkoutActions } from "./hooks/useWorkoutActions";
import { useCalendarNavigation } from "./hooks/useCalendarNavigation";

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
  console.log("ProgramWorkoutCalendar - Props received:", {
    workouts,
    competitions,
    programId
  });

  const { user } = useAuth();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const events = useEvents({ workouts, competitions });
  console.log("ProgramWorkoutCalendar - Processed events:", events);

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
  console.log("ProgramWorkoutCalendar - Filtered workouts before theme:", filteredWorkouts);

  if (selectedTheme) {
    filteredWorkouts = filteredWorkouts.filter((event) => event.theme === selectedTheme);
    console.log("ProgramWorkoutCalendar - Filtered workouts after theme filter:", filteredWorkouts);
  }

  filteredWorkouts.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  console.log("ProgramWorkoutCalendar - Final filtered and sorted workouts:", filteredWorkouts);

  return (
    <div className="space-y-8">
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
                  {user?.role === 'coach' && (
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
                  )}
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