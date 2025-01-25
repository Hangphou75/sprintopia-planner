import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Timer, Trophy, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

type Event = {
  id: string;
  title: string;
  date: Date;
  type: "workout" | "competition";
  theme?: string;
};

type ProgramWorkoutCalendarProps = {
  workouts: any[];
  competitions: any[];
  programId: string;
};

export const ProgramWorkoutCalendar = ({
  workouts,
  competitions,
  programId,
}: ProgramWorkoutCalendarProps) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Combine workouts and competitions into events
  const events: Event[] = [
    ...workouts.map((workout) => ({
      id: workout.id,
      title: workout.title,
      date: new Date(workout.date),
      type: "workout" as const,
      theme: workout.theme,
    })),
    ...competitions.map((competition) => ({
      id: competition.id,
      title: competition.name,
      date: new Date(competition.date),
      type: "competition" as const,
    })),
  ];

  // Get events for selected date
  const selectedDateEvents = events.filter(
    (event) =>
      event.date.toISOString().split("T")[0] ===
      selectedDate?.toISOString().split("T")[0]
  );

  const handleEventClick = (event: Event) => {
    if (event.type === "workout") {
      navigate(`/coach/programs/${programId}/workouts/${event.id}/edit`);
    } else {
      // Handle competition click - you'll need to implement this route
      navigate(`/coach/programs/${programId}/competitions/${event.id}/edit`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
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

        <div className="space-y-2">
          <h3 className="font-semibold">
            {selectedDate?.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>
          {selectedDateEvents.length === 0 ? (
            <p className="text-muted-foreground">Aucun événement ce jour</p>
          ) : (
            selectedDateEvents.map((event) => (
              <Card
                key={event.id}
                className={cn(
                  "cursor-pointer hover:border-primary transition-colors",
                  event.type === "workout" && event.theme && `border-theme-${event.theme}`
                )}
                onClick={() => handleEventClick(event)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {event.type === "workout" ? (
                        <Timer className="h-4 w-4" />
                      ) : (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};