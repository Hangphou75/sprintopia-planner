
import { Event, ThemeOption } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {event.title}
            <Badge variant="default">Séance</Badge>
            {event.theme && themeOptions && (
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
      <CardContent>
        {event.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            - {formatDescription(event.description)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
