
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Event } from "../types";
import { WorkoutEventCard } from "./WorkoutEventCard";
import { CompetitionEventCard } from "./CompetitionEventCard";

interface DayCardProps {
  day: Date;
  isToday: boolean;
  dayLabel: string;
  dayEvents: Event[];
  onEventClick: (event: Event) => void;
  onEditClick?: (event: Event) => void;
  readOnly?: boolean;
  themeOptions?: any[];
  isProcessing: boolean;
}

export const DayCard = ({
  day,
  isToday,
  dayLabel,
  dayEvents,
  onEventClick,
  onEditClick,
  readOnly = false,
  themeOptions = [],
  isProcessing
}: DayCardProps) => {
  const handleEventClick = (event: Event) => {
    if (isProcessing) return;
    onEventClick(event);
  };

  return (
    <Card 
      key={day.toString()} 
      className={`p-4 min-h-[200px] ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}`}
    >
      <h4 className={`font-medium mb-3 pb-2 border-b ${isToday ? 'text-primary' : ''}`}>
        {dayLabel}
      </h4>
      <div className="space-y-3">
        {dayEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun événement</p>
        ) : (
          dayEvents.map(event => {
            if (!event || !event.id) return null;
            
            return (
              <div 
                key={event.id} 
                className="cursor-pointer transition-opacity hover:opacity-80" 
                onClick={() => handleEventClick(event)}
              >
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
            );
          })
        )}
      </div>
    </Card>
  );
};
