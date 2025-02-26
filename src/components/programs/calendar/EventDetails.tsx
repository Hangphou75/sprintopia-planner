
import { Event, ThemeOption } from "../types";
import { format, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { CompetitionEventCard } from "./CompetitionEventCard";
import { WorkoutEventCard } from "./WorkoutEventCard";

interface EventDetailsProps {
  events: Event[];
  selectedDate: Date;
  onEventClick?: (event: Event) => void;
  onEditClick?: (event: Event) => void;
  readOnly?: boolean;
  themeOptions?: ThemeOption[];
}

export const EventDetails = ({
  events,
  selectedDate,
  onEventClick,
  onEditClick,
  readOnly = false,
  themeOptions = [],
}: EventDetailsProps) => {
  const selectedDateEvents = events.filter((event) => {
    try {
      const eventDate = startOfDay(new Date(event.date));
      const compareDate = startOfDay(selectedDate);
      return eventDate.getTime() === compareDate.getTime();
    } catch (error) {
      console.error("Error comparing dates:", error);
      return false;
    }
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">
        {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
      </h3>
      {selectedDateEvents.length === 0 ? (
        <p className="text-muted-foreground">Aucun événement prévu ce jour</p>
      ) : (
        <div className="space-y-4">
          {selectedDateEvents.map((event) => (
            <div key={event.id} onClick={() => onEventClick?.(event)}>
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
          ))}
        </div>
      )}
    </div>
  );
};
