import { Event } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface CompetitionEventCardProps {
  event: Event;
  onEditClick?: (event: Event) => void;
  readOnly?: boolean;
}

export const CompetitionEventCard = ({
  event,
  onEditClick,
  readOnly = false,
}: CompetitionEventCardProps) => {
  const levelLabels: { [key: string]: string } = {
    local: "Local",
    regional: "Régional",
    national: "National",
    international: "International",
  };

  return (
    <Card
      className={cn(
        "border-l-4 border-yellow-500",
        "cursor-pointer hover:border-primary transition-colors"
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {event.title}
            <Badge variant="secondary">Compétition</Badge>
            {event.level && (
              <Badge variant="outline">
                {levelLabels[event.level] || event.level}
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
        <div className="space-y-2">
          {event.location && (
            <p className="text-sm text-muted-foreground">
              Lieu : {event.location}
            </p>
          )}
          {event.distance && (
            <p className="text-sm text-muted-foreground">
              Distance : {event.distance}m
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};