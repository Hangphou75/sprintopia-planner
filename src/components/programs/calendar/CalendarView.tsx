
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Event } from "../types";
import { useCallback, useState, useRef, useEffect } from "react";
import { toast } from "sonner";

type CalendarViewProps = {
  events: Event[];
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
};

export const CalendarView = ({
  events,
  selectedDate,
  onSelectDate,
}: CalendarViewProps) => {
  // Protection contre les clics rapides
  const [isProcessing, setIsProcessing] = useState(false);
  const lastClickTime = useRef(0);
  const lastSelectedDate = useRef<Date | null>(null);

  // Protéger contre les événements non valides
  const safeEvents = Array.isArray(events) ? events : [];

  // Nettoyer le traitement à la déconnexion du composant
  useEffect(() => {
    return () => {
      setIsProcessing(false);
    };
  }, []);

  const formatDate = useCallback((date: Date | null | undefined): string => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.error("Invalid date in formatDate:", date);
        return "";
      }
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  }, []);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    // Protection contre les clics trop rapides
    const now = Date.now();
    if (isProcessing || (now - lastClickTime.current < 800)) {
      console.log("Ignoring fast click in CalendarView");
      return;
    }

    // Protection contre le double clic sur la même date
    if (date && lastSelectedDate.current && 
        formatDate(date) === formatDate(lastSelectedDate.current)) {
      console.log("Ignoring repeated click on same date");
      return;
    }

    lastClickTime.current = now;
    setIsProcessing(true);

    try {
      // Vérifier que la date est valide
      if (date && date instanceof Date && !isNaN(date.getTime())) {
        lastSelectedDate.current = date;
        onSelectDate(date);
      } else if (date) {
        console.error("Invalid date selected:", date);
        toast.error("Date invalide sélectionnée");
        onSelectDate(new Date()); // Fallback sur aujourd'hui
      } else {
        onSelectDate(undefined);
      }
    } catch (error) {
      console.error("Error in date selection:", error);
      toast.error("Erreur lors de la sélection de date");
    } finally {
      // Réinitialiser après un court délai
      setTimeout(() => {
        setIsProcessing(false);
      }, 600);
    }
  }, [isProcessing, onSelectDate, formatDate]);

  const renderDayContent = useCallback(({ date }: { date: Date | null | undefined }) => {
    try {
      // Vérifier que la date est valide
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return <div className="text-muted-foreground">--</div>;
      }

      const currentDateStr = formatDate(date);
      
      const dayEvents = safeEvents.filter((event) => {
        try {
          if (!event || !event.date) return false;
          
          // S'assurer que la date de l'événement est valide
          const eventDate = event.date instanceof Date 
            ? event.date 
            : new Date(event.date);
            
          if (isNaN(eventDate.getTime())) {
            return false;
          }
          
          return formatDate(eventDate) === currentDateStr;
        } catch (error) {
          console.error("Error comparing dates:", error);
          return false;
        }
      });

      return (
        <div className="relative w-full h-full">
          <div>{date.getDate()}</div>
          {dayEvents.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center">
              <div className="flex gap-0.5">
                {dayEvents.map((event, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1 w-1 rounded-full",
                      event.type === "competition" 
                        ? "bg-competition" 
                        : "bg-foreground"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error("Error rendering day content:", error);
      return <div className="text-muted-foreground">--</div>;
    }
  }, [safeEvents, formatDate]);

  // Validation supplémentaire du selectedDate passé
  const validSelectedDate = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
    ? selectedDate 
    : undefined;

  return (
    <Calendar
      mode="single"
      selected={validSelectedDate}
      onSelect={handleDateSelect}
      className="rounded-md border"
      components={{
        DayContent: renderDayContent,
      }}
    />
  );
};
