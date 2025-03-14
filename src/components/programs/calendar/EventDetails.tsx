
import { Event, ThemeOption } from "../types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { WorkoutEventCard } from "./WorkoutEventCard";
import { CompetitionEventCard } from "./CompetitionEventCard";

type EventDetailsProps = {
  events: Event[];
  selectedDate: Date;
  themeOptions: ThemeOption[];
  onEventClick: (event: Event) => void;
  onEditClick?: (event: Event) => void;
  readOnly?: boolean;
};

export const EventDetails = ({
  events,
  selectedDate,
  themeOptions,
  onEventClick,
  onEditClick,
  readOnly = false,
}: EventDetailsProps) => {
  // Filter events for the selected date
  const eventsForDate = events.filter((event) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Sort events by time
  const sortedEvents = [...eventsForDate].sort((a, b) => {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => (
              <div 
                key={event.id} 
                onClick={() => onEventClick(event)}
              >
                {event.type === "workout" ? (
                  <WorkoutEventCard 
                    event={event} 
                    themeOptions={themeOptions} 
                    onEditClick={onEditClick}
                    readOnly={readOnly}
                  />
                ) : (
                  <CompetitionEventCard event={event} />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Aucun événement programmé
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
