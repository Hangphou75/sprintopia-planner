
import { Event, ThemeOption } from "../types";
import { format, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { CompetitionEventCard } from "./CompetitionEventCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const formatDescription = (description: string) => {
    return description.split(',').map(item => item.trim()).join('\n- ');
  };

  const renderWorkoutEvent = (event: Event) => (
    <Card
      key={event.id}
      className={cn(
        "border-l-4",
        "cursor-pointer hover:border-primary transition-colors",
        event.theme && `border-theme-${event.theme}`
      )}
      onClick={() => onEventClick?.(event)}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {event.title}
            <Badge variant="default">Séance</Badge>
          </div>
          {!readOnly && onEditClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEditClick(event);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {event.theme && themeOptions && (
            <Badge variant="outline">
              {themeOptions.find(t => t.value === event.theme)?.label}
            </Badge>
          )}
          {event.time && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{event.time}</span>
            </div>
          )}
        </div>

        {event.description && (
          <div className="space-y-2">
            <h4 className="font-medium">Description</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              - {formatDescription(event.description)}
            </p>
          </div>
        )}

        {event.details && (
          <div className="space-y-2">
            <h4 className="font-medium">Détails</h4>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {event.details}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

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
            <div key={event.id}>
              {event.type === "competition" ? (
                <CompetitionEventCard
                  event={event}
                  onEditClick={onEditClick}
                  readOnly={readOnly}
                />
              ) : (
                renderWorkoutEvent(event)
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
