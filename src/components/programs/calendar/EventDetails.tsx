import { Event, ThemeOption } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
  const selectedDateEvents = events.filter(
    (event) =>
      format(new Date(event.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
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
            <Card
              key={event.id}
              className={cn(
                "border-l-4",
                "cursor-pointer hover:border-primary transition-colors",
                event.type === "workout" && event.theme && `border-theme-${event.theme}`
              )}
              onClick={() => onEventClick?.(event)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {event.title}
                    <Badge variant={event.type === "workout" ? "default" : "destructive"}>
                      {event.type === "workout" ? "Séance" : "Compétition"}
                    </Badge>
                    {event.type === "workout" && event.theme && themeOptions && (
                      <Badge variant="outline">
                        {themeOptions.find(t => t.value === event.theme)?.label}
                      </Badge>
                    )}
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
              {event.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};