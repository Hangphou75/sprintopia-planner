
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Event } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EventDetailsProps = {
  events: Event[];
  selectedDate: Date;
  themeOptions: {
    value: string;
    label: string;
  }[];
  onEventClick: (event: Event) => void;
  onEditClick: (event: Event) => void;
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
  const formatDate = (date: Date) => {
    return format(date, "EEEE d MMMM yyyy", { locale: fr });
  };

  const eventsForSelectedDate = events.filter((event) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const getEventTheme = (theme: string) => {
    const foundTheme = themeOptions.find((t) => t.value === theme);
    return foundTheme ? foundTheme.label : theme;
  };

  const handleEditClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Edit button clicked for event:", event);
    onEditClick(event);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {formatDate(selectedDate)}
      </h2>
      {eventsForSelectedDate.length === 0 ? (
        <div className="text-muted-foreground">Aucune séance prévue</div>
      ) : (
        <div className="space-y-4">
          {eventsForSelectedDate.map((event) => (
            <Card
              key={event.id}
              className={cn(
                "cursor-pointer hover:border-primary transition-colors",
                event.type === "workout"
                  ? "border-l-4 border-l-primary"
                  : "border-l-4 border-l-yellow-500"
              )}
              onClick={() => onEventClick(event)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-start">
                  <div className="text-base">
                    <span className="mr-2">{event.title}</span>
                    {event.type === "workout" && event.theme && (
                      <Badge variant="outline">
                        {getEventTheme(event.theme)}
                      </Badge>
                    )}
                    {event.type === "competition" && (
                      <Badge variant="outline" className="bg-yellow-100">
                        Compétition
                      </Badge>
                    )}
                  </div>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleEditClick(event, e)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {event.time
                    ? `${event.time} - ${
                        event.type === "workout"
                          ? event.description || "Aucune description"
                          : event.description
                      }`
                    : event.description || "Aucune description"}
                </p>
                <div className="flex justify-end mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs flex items-center gap-1"
                  >
                    Voir les détails <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
