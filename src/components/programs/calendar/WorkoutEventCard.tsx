
import { Event, ThemeOption } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface WorkoutEventCardProps {
  event: Event;
  onEditClick?: (event: Event) => void;
  readOnly?: boolean;
  themeOptions?: ThemeOption[];
}

export const WorkoutEventCard = ({
  event,
  onEditClick,
  readOnly = false,
  themeOptions = [],
}: WorkoutEventCardProps) => {
  return (
    <Card
      className={cn(
        "border-l-4",
        "cursor-pointer hover:border-primary transition-colors",
        event.theme && `border-theme-${event.theme}`
      )}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium leading-tight">
            {event.title}
          </h3>
          {!readOnly && onEditClick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onEditClick(event);
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
        </div>

        {event.theme && themeOptions && (
          <Badge variant="outline" className="text-xs">
            {themeOptions.find(t => t.value === event.theme)?.label}
          </Badge>
        )}

        {event.time && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{event.time}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
