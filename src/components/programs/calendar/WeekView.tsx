
import { Event } from "../types";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { WorkoutEventCard } from "./WorkoutEventCard";
import { CompetitionEventCard } from "./CompetitionEventCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  themeOptions = [],
}: WeekViewProps) => {
  const startDate = startOfWeek(currentDate, { locale: fr });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const prevWeek = () => {
    onDateChange(addDays(startDate, -7));
  };

  const nextWeek = () => {
    onDateChange(addDays(startDate, 7));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="icon" onClick={prevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold">
          {format(startDate, "'Semaine du' d MMMM yyyy", { locale: fr })}
        </h3>
        <Button variant="outline" size="icon" onClick={nextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayEvents = events.filter((event) => isSameDay(day, new Date(event.date)));

          return (
            <div key={day.toString()} className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">
                {format(day, "EEEE d", { locale: fr })}
              </h4>
              <div className="space-y-2">
                {dayEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun événement</p>
                ) : (
                  dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="cursor-pointer"
                      onClick={() => onEventClick?.(event)}
                    >
                      {event.type === "competition" ? (
                        <CompetitionEventCard
                          event={event}
                          onEditClick={onEditClick}
                          readOnly={readOnly}
                        />
                      ) : (
                        <WorkoutEventCard
                          event={event}
                          onEditClick={onEditClick}
                          readOnly={readOnly}
                          themeOptions={themeOptions}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
