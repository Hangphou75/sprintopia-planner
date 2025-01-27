import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Trophy, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Event, ThemeOption } from "../types";

type EventDetailsProps = {
  events: Event[];
  selectedDate: Date | undefined;
  themeOptions: ThemeOption[];
  onEventClick: (event: Event) => void;
};

export const EventDetails = ({
  events,
  selectedDate,
  themeOptions,
  onEventClick,
}: EventDetailsProps) => {
  if (!selectedDate) return null;

  const selectedDateEvents = events.filter(
    (event) =>
      new Date(event.date).toISOString().split("T")[0] ===
      selectedDate.toISOString().split("T")[0]
  );

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">
        {selectedDate.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </h3>
      {selectedDateEvents.length === 0 ? (
        <p className="text-muted-foreground">Aucun événement ce jour</p>
      ) : (
        selectedDateEvents.map((event) => (
          <Card
            key={event.id}
            className={cn(
              "cursor-pointer hover:border-primary transition-colors",
              event.type === "workout" && event.theme && `border-theme-${event.theme}`
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {event.type === "workout" ? (
                    <Timer className="h-4 w-4" />
                  ) : (
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  )}
                  <span>{event.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {event.time && (
                <p className="text-sm text-muted-foreground mb-2">
                  Heure : {event.time}
                </p>
              )}
              {event.description && (
                <p className="text-sm">{event.description}</p>
              )}
              {event.type === "workout" && event.theme && (
                <p className="text-sm mt-2">
                  Type : {themeOptions.find(t => t.value === event.theme)?.label}
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};