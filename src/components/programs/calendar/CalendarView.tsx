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
  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={onSelectDate}
      className="rounded-md border"
      components={{
        DayContent: ({ date }) => {
          const dayEvents = events.filter(
            (event) =>
              event.date.toISOString().split("T")[0] ===
              date.toISOString().split("T")[0]
          );

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
                          "w-1 h-1 rounded-full",
                          event.type === "workout"
                            ? `bg-theme-${event.theme}`
                            : "bg-yellow-500"
                        )}
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