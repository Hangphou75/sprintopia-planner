
import { useState, useEffect } from "react";
import { Timer, Trophy, Dumbbell, Activity, Zap, Flame, Settings, Plus } from "lucide-react";
import { CalendarView } from "./calendar/CalendarView";
import { EventDetails } from "./calendar/EventDetails";
import { EventFilters } from "./calendar/EventFilters";
import { WorkoutList } from "./calendar/WorkoutList";
import { WeekView } from "./calendar/WeekView";
import { ThemeOption } from "./types";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "./hooks/useEvents";
import { useWorkoutActions } from "./hooks/useWorkoutActions";
import { useCalendarNavigation } from "./hooks/useCalendarNavigation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
type ProgramWorkoutCalendarProps = {
  workouts: any[];
  competitions: any[];
  programId: string;
  onRefresh?: () => void;
};
const themeOptions: ThemeOption[] = [{
  value: "aerobic",
  label: "Aérobie"
}, {
  value: "anaerobic-alactic",
  label: "Anaérobie alactique"
}, {
  value: "anaerobic-lactic",
  label: "Anaérobie lactique"
}, {
  value: "strength",
  label: "Force"
}, {
  value: "technical",
  label: "Technique"
}, {
  value: "mobility",
  label: "Mobilité"
}, {
  value: "plyometric",
  label: "Pliométrie"
}];
const themeIcons: {
  [key: string]: any;
} = {
  "aerobic": Activity,
  "anaerobic-alactic": Zap,
  "anaerobic-lactic": Flame,
  "strength": Dumbbell,
  "technical": Activity,
  "mobility": Activity,
  "plyometric": Activity
};
export const ProgramWorkoutCalendar = ({
  workouts,
  competitions,
  programId,
  onRefresh
}: ProgramWorkoutCalendarProps) => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  useEffect(() => {
    console.log("ProgramWorkoutCalendar - Rendering with user role:", user?.role);
    console.log("Workouts data:", workouts);
    console.log("Competitions data:", competitions);
  }, [user, workouts, competitions]);
  const events = useEvents({
    workouts,
    competitions
  });
  const {
    handleDuplicateWorkout,
    handleDeleteWorkout
  } = useWorkoutActions({
    programId,
    userRole: user?.role,
    onSuccess: onRefresh
  });
  const {
    selectedDate,
    handleEventClick,
    handleEditWorkout,
    handleDateSelect
  } = useCalendarNavigation({
    programId,
    userRole: user?.role
  });

  // Déterminer si l'utilisateur est en lecture seule
  const isReadOnly = user?.role === 'athlete';

  // Méthode pour créer une nouvelle séance
  const handleNewWorkout = () => {
    // Autoriser également les admins à créer des séances
    if (user?.role === 'coach' || user?.role === 'admin') {
      navigate(`/coach/programs/${programId}/workouts/new`);
    } else if (user?.role === 'individual_athlete') {
      navigate(`/individual-athlete/programs/${programId}/workouts/new`);
    }
  };

  // Méthode pour accéder aux paramètres du programme
  const handleProgramSettings = () => {
    // Autoriser également les admins à modifier les programmes
    if (user?.role === 'coach' || user?.role === 'admin') {
      navigate(`/coach/programs/${programId}/edit`);
    } else if (user?.role === 'individual_athlete') {
      navigate(`/individual-athlete/programs/${programId}/edit`);
    }
  };
  let filteredWorkouts = events.filter(event => event.type === "workout");
  if (selectedTheme) {
    filteredWorkouts = filteredWorkouts.filter(event => event.theme === selectedTheme);
  }
  filteredWorkouts.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Déterminer si on doit montrer les boutons d'action
  // Inclure explicitement les admins pour les autorisations
  const showActionButtons = user?.role === 'coach' || user?.role === 'admin' || user?.role === 'individual_athlete';
  return <div className="space-y-8">
      {/* Actions du programme (pour coach, admin ou individual_athlete) */}
      {showActionButtons && <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleProgramSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
          <Button size="sm" onClick={handleNewWorkout}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle séance
          </Button>
        </div>}

      {/* Vue mensuelle et détails - réorganisés pour mobile */}
      <div className={`${isMobile ? 'flex flex-col space-y-6' : 'grid md:grid-cols-2 gap-4'}`}>
        {isMobile ? <>
            <EventDetails events={events} selectedDate={selectedDate} themeOptions={themeOptions} onEventClick={handleEventClick} onEditClick={handleEditWorkout} readOnly={isReadOnly} />
            <CalendarView events={events} selectedDate={selectedDate} onSelectDate={handleDateSelect} />
          </> : <>
            <CalendarView events={events} selectedDate={selectedDate} onSelectDate={handleDateSelect} />
            <EventDetails events={events} selectedDate={selectedDate} themeOptions={themeOptions} onEventClick={handleEventClick} onEditClick={handleEditWorkout} readOnly={isReadOnly} />
          </>}
      </div>

      {/* Vue liste ou semaine en dessous */}
      <div className="space-y-4">
        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">Vue liste</TabsTrigger>
            <TabsTrigger value="week">Vue semaine</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-sm text-left">Liste des séances</h2>
              <EventFilters selectedTheme={selectedTheme} sortOrder={sortOrder} themeOptions={themeOptions} onThemeChange={setSelectedTheme} onSortOrderChange={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} />
            </div>

            <WorkoutList filteredWorkouts={filteredWorkouts} themeOptions={themeOptions} themeIcons={themeIcons} onEventClick={handleEventClick} onDuplicateWorkout={handleDuplicateWorkout} onDeleteWorkout={handleDeleteWorkout} onEditWorkout={handleEditWorkout} userRole={user?.role} />
          </TabsContent>

          <TabsContent value="week">
            <WeekView events={events} currentDate={selectedDate} onDateChange={handleDateSelect} onEventClick={handleEventClick} themeOptions={themeOptions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
