import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Event } from "../types";

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
  const formatDate = (date: Date): string => {
    try {
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={(date) => {
        try {
          onSelectDate(date || undefined);
        } catch (error) {
          console.error("Error selecting date:", error);
        }
      }}
      className="rounded-md border"
      components={{
        DayContent: ({ date }) => {
          const currentDateStr = formatDate(date);
          const dayEvents = events.filter((event) => {
            try {
              const eventDate = event.date instanceof Date 
                ? event.date 
                : new Date(event.date);
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
                        className="h-1 w-1 rounded-full bg-foreground"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        },
      }}
    />
  );
};