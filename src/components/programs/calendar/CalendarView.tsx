
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Event } from "../types";
import { useCallback, useState, useRef } from "react";

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

  const formatDate = useCallback((date: Date): string => {
    try {
      if (!date || isNaN(date.getTime())) {
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
    if (isProcessing || (now - lastClickTime.current < 500)) {
      console.log("Ignoring fast click");
      return;
    }

    lastClickTime.current = now;
    setIsProcessing(true);

    try {
      // Vérifier que la date est valide
      if (date && !isNaN(date.getTime())) {
        onSelectDate(date);
      } else if (date) {
        console.error("Invalid date selected:", date);
        onSelectDate(new Date()); // Fallback sur aujourd'hui
      } else {
        onSelectDate(undefined);
      }
    } catch (error) {
      console.error("Error in date selection:", error);
    } finally {
      // Réinitialiser après un court délai
      setTimeout(() => {
        setIsProcessing(false);
      }, 300);
    }
  }, [isProcessing, onSelectDate]);

  const renderDayContent = useCallback(({ date }: { date: Date }) => {
    try {
      // Vérifier que la date est valide
      if (!date || isNaN(date.getTime())) {
        console.error("Invalid date in DayContent:", date);
        return <div>--</div>;
      }

      const currentDateStr = formatDate(date);
      const dayEvents = events.filter((event) => {
        try {
          if (!event || !event.date) return false;
          
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
      return <div>{date?.getDate?.() || "--"}</div>;
    }
  }, [events, formatDate]);

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleDateSelect}
      className="rounded-md border"
      components={{
        DayContent: renderDayContent,
      }}
    />
  );
};
