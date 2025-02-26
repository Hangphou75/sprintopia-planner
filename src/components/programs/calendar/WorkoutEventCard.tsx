
import { Event, ThemeOption } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

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
  const formatDescription = (description: string) => {
    return description.split(',').map(item => item.trim()).join('\n- ');
  };

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

        <div className="flex flex-wrap gap-1">
          <Badge variant="default" className="text-xs">Séance</Badge>
          {event.theme && themeOptions && (
            <Badge variant="outline" className="text-xs">
              {themeOptions.find(t => t.value === event.theme)?.label}
            </Badge>
          )}
        </div>

        {event.description && (
          <p className="text-xs text-muted-foreground whitespace-pre-wrap">
            - {formatDescription(event.description)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
