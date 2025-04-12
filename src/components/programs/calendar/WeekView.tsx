
import { Event } from "../types";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { WorkoutEventCard } from "./WorkoutEventCard";
import { CompetitionEventCard } from "./CompetitionEventCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface WeekViewProps {
  events: Event[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick?: (event: Event) => void;
  onEditClick?: (event: Event) => void;
  readOnly?: boolean;
  themeOptions?: any[];
}

export const WeekView = ({
  events,
  currentDate,
  onDateChange,
  onEventClick,
  onEditClick,
  readOnly = false,
  themeOptions = []
}: WeekViewProps) => {
  // Protection contre les dates non valides
  const validCurrentDate = currentDate instanceof Date && !isNaN(currentDate.getTime())
    ? currentDate
    : new Date();

  const startDate = startOfWeek(validCurrentDate, {
    locale: fr
  });
  
  const weekDays = Array.from({
    length: 7
  }, (_, i) => addDays(startDate, i));
  
  const prevWeek = () => {
    onDateChange(addDays(startDate, -7));
  };
  
  const nextWeek = () => {
    onDateChange(addDays(startDate, 7));
  };
  
  // Fonction sécurisée pour filtrer les événements par date
  const getEventsForDay = (day: Date) => {
    if (!events || !Array.isArray(events)) return [];
    
    return events.filter(event => {
      if (!event.date) return false;
      
      // Protection contre les dates invalides
      try {
        const eventDate = event.date instanceof Date 
          ? event.date 
          : new Date(event.date);
          
        return isSameDay(day, eventDate);
      } catch (error) {
        console.error("Error comparing dates:", error, event);
        return false;
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="icon" onClick={prevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-sm text-center">
          {format(startDate, "'Semaine du' d MMMM yyyy", {
            locale: fr
          })}
        </h3>
        <Button variant="outline" size="icon" onClick={nextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map(day => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <Card 
              key={day.toString()} 
              className={`p-4 min-h-[200px] ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            >
              <h4 className={`font-medium mb-3 pb-2 border-b ${isToday ? 'text-primary' : ''}`}>
                {format(day, "EEEE d", {
                  locale: fr
                })}
              </h4>
              <div className="space-y-3">
                {dayEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun événement</p>
                ) : (
                  dayEvents.map(event => (
                    <div 
                      key={event.id} 
                      className="cursor-pointer transition-opacity hover:opacity-80" 
                      onClick={() => onEventClick?.(event)}
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
                  ))
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
