
import { Event } from "../types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getValidDate, getWeekStartDate, getWeekDays, formatDate, isToday } from "./utils/dateUtils";
import { getEventsForDay } from "./utils/eventUtils";
import { useWeekNavigation } from "./hooks/useWeekNavigation";
import { WeekNavigation } from "./WeekNavigation";
import { DayCard } from "./DayCard";

interface WeekViewProps {
  events: Event[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick?: (event: Event) => void;
  onEditClick?: (event: Event) => void;
  readOnly?: boolean;
  themeOptions?: any[];
}

export const WeekView = ({
  events,
  currentDate,
  onDateChange,
  onEventClick,
  onEditClick,
  readOnly = false,
  themeOptions = []
}: WeekViewProps) => {
  // Protection contre les dates non valides
  const validCurrentDate = getValidDate(currentDate);
  const startDate = getWeekStartDate(validCurrentDate);
  const weekDays = getWeekDays(startDate);
  
  const {
    isProcessing,
    prevWeek,
    nextWeek,
    handleEventClick
  } = useWeekNavigation({
    onDateChange,
    onEventClick
  });

  // Format de la semaine
  const weekLabel = format(startDate, "'Semaine du' d MMMM yyyy", { locale: fr });

  return (
    <div className="space-y-6">
      <WeekNavigation
        startDate={startDate}
        onPrevWeek={() => prevWeek(startDate)}
        onNextWeek={() => nextWeek(startDate)}
        isProcessing={isProcessing}
        dateLabel={weekLabel}
      />

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map(day => {
          // Vérifier que la date est valide
          if (!day || isNaN(day.getTime())) {
            return (
              <div key={Math.random().toString()} className="p-4 min-h-[200px]">
                <h4 className="font-medium mb-3 pb-2 border-b">Jour invalide</h4>
              </div>
            );
          }
          
          const dayEvents = getEventsForDay(events, day);
          const dayIsToday = isToday(day);
          const dayLabel = formatDate(day, "EEEE d");
          
          return (
            <DayCard
              key={day.toString()}
              day={day}
              isToday={dayIsToday}
              dayLabel={dayLabel}
              dayEvents={dayEvents}
              onEventClick={handleEventClick}
              onEditClick={onEditClick}
              readOnly={readOnly}
              themeOptions={themeOptions}
              isProcessing={isProcessing}
            />
          );
        })}
      </div>
    </div>
  );
};
