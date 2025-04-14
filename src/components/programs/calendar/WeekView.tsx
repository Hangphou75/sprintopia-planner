
import { Event } from "../types";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { WorkoutEventCard } from "./WorkoutEventCard";
import { CompetitionEventCard } from "./CompetitionEventCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCallback, useState, useRef, useEffect } from "react";
import { toast } from "sonner";

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
  // Protection contre les clics trop fréquents
  const [isProcessing, setIsProcessing] = useState(false);
  const lastClickTime = useRef(0);

  // Nettoyage à la déconnexion du composant
  useEffect(() => {
    return () => {
      setIsProcessing(false);
    };
  }, []);

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
  
  // Utilisation de useCallback pour éviter les re-renders inutiles
  const prevWeek = useCallback(() => {
    const now = Date.now();
    if (isProcessing || (now - lastClickTime.current < 500)) {
      console.log("Ignoring fast click in WeekView navigation");
      return;
    }
    
    lastClickTime.current = now;
    setIsProcessing(true);
    
    try {
      onDateChange(addDays(startDate, -7));
    } catch (error) {
      console.error("Error in prevWeek:", error);
      toast.error("Erreur de navigation");
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  }, [startDate, onDateChange, isProcessing]);
  
  const nextWeek = useCallback(() => {
    const now = Date.now();
    if (isProcessing || (now - lastClickTime.current < 500)) {
      console.log("Ignoring fast click in WeekView navigation");
      return;
    }
    
    lastClickTime.current = now;
    setIsProcessing(true);
    
    try {
      onDateChange(addDays(startDate, 7));
    } catch (error) {
      console.error("Error in nextWeek:", error);
      toast.error("Erreur de navigation");
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  }, [startDate, onDateChange, isProcessing]);
  
  // Fonction pour convertir une heure au format "HH:mm" en minutes depuis minuit
  const getTimeValue = (timeString: string | null | undefined): number => {
    if (!timeString) return Number.MAX_SAFE_INTEGER;
    
    const parts = timeString.split(':');
    if (parts.length === 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      return hours * 60 + minutes;
    }
    return Number.MAX_SAFE_INTEGER;
  };
  
  // Fonction sécurisée pour filtrer les événements par date et les trier par heure
  const getEventsForDay = useCallback((day: Date) => {
    if (!events || !Array.isArray(events)) return [];
    
    const filteredEvents = events.filter(event => {
      if (!event || !event.date) return false;
      
      // Protection contre les dates invalides
      try {
        const eventDate = event.date instanceof Date 
          ? event.date 
          : new Date(event.date);
          
        if (isNaN(eventDate.getTime())) {
          return false;
        }
          
        return isSameDay(day, eventDate);
      } catch (error) {
        console.error("Error comparing dates:", error);
        return false;
      }
    });
    
    // Trier les événements par heure
    return filteredEvents.sort((a, b) => {
      const timeA = getTimeValue(a.time);
      const timeB = getTimeValue(b.time);
      return timeA - timeB;
    });
  }, [events]);

  // Protection contre les clics rapides qui pourraient causer des erreurs
  const handleEventClick = useCallback((event: Event) => {
    const now = Date.now();
    if (isProcessing || (now - lastClickTime.current < 500)) {
      console.log("Ignoring fast click on event");
      return;
    }
    
    lastClickTime.current = now;
    setIsProcessing(true);
    
    try {
      if (!event || !event.id) {
        console.error("Invalid event in handleEventClick:", event);
        return;
      }
      
      if (onEventClick) {
        onEventClick(event);
      }
    } catch (error) {
      console.error("Error in onEventClick:", error);
      toast.error("Erreur lors de la sélection d'un événement");
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  }, [onEventClick, isProcessing]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="icon" onClick={prevWeek} disabled={isProcessing}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-sm text-center">
          {format(startDate, "'Semaine du' d MMMM yyyy", {
            locale: fr
          })}
        </h3>
        <Button variant="outline" size="icon" onClick={nextWeek} disabled={isProcessing}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map(day => {
          // Vérifier que la date est valide avant de continuer
          if (!day || isNaN(day.getTime())) {
            return (
              <Card key={Math.random().toString()} className="p-4 min-h-[200px]">
                <h4 className="font-medium mb-3 pb-2 border-b">Jour invalide</h4>
              </Card>
            );
          }
          
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
        })}
      </div>
    </div>
  );
};
