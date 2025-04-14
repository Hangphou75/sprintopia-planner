
import { useEffect } from "react";
import { Timer, Trophy, Dumbbell, Activity, Zap, Flame } from "lucide-react";
import { ThemeOption } from "./types";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "./hooks/useEvents";
import { useWorkoutActions } from "./hooks/useWorkoutActions";
import { useCalendarNavigation } from "./hooks/useCalendarNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWorkoutsFiltering } from "./hooks/useWorkoutsFiltering";
import { ActionButtons } from "./calendar/ActionButtons";
import { EventsDisplay } from "./calendar/EventsDisplay";
import { EventsTabView } from "./calendar/EventsTabView";

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
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
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

  const {
    filteredWorkouts,
    selectedTheme,
    sortOrder,
    setSelectedTheme,
    handleSortOrderChange
  } = useWorkoutsFiltering(events);

  // Determine if the user is in read-only mode
  const isReadOnly = user?.role === 'athlete';

  // Determine if we should show the action buttons
  const showActionButtons = user?.role === 'coach' || user?.role === 'admin' || user?.role === 'individual_athlete';
  
  return (
    <div className="space-y-8">
      {/* Action buttons */}
      <ActionButtons 
        programId={programId}
        userRole={user?.role}
        showActionButtons={showActionButtons}
        isMobile={isMobile}
      />

      {/* Calendar and event details */}
      <EventsDisplay 
        events={events}
        selectedDate={selectedDate}
        themeOptions={themeOptions}
        onEventClick={handleEventClick}
        onEditClick={handleEditWorkout}
        readOnly={isReadOnly}
        isMobile={isMobile}
        onSelectDate={handleDateSelect}
      />

      {/* Tabbed views (list and week) */}
      <EventsTabView 
        events={events}
        filteredWorkouts={filteredWorkouts}
        selectedTheme={selectedTheme}
        sortOrder={sortOrder}
        themeOptions={themeOptions}
        themeIcons={themeIcons}
        selectedDate={selectedDate}
        onEventClick={handleEventClick}
        onDuplicateWorkout={handleDuplicateWorkout}
        onDeleteWorkout={handleDeleteWorkout}
        onEditWorkout={handleEditWorkout}
        onSelectDate={handleDateSelect}
        onThemeChange={setSelectedTheme}
        onSortOrderChange={handleSortOrderChange}
        userRole={user?.role}
      />
    </div>
  );
};
