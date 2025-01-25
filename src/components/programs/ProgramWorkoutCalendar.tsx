import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Timer, Trophy, Edit, Eye, ArrowUp, ArrowDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type Event = {
  id: string;
  title: string;
  date: Date;
  type: "workout" | "competition";
  theme?: string;
  description?: string;
  time?: string;
  details?: any;
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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Combine workouts and competitions into events
  const events: Event[] = [
    ...workouts.map((workout) => ({
      id: workout.id,
      title: workout.title,
      date: new Date(workout.date),
      type: "workout" as const,
      theme: workout.theme,
      description: workout.description,
      time: workout.time,
      details: workout.details,
    })),
    ...competitions.map((competition) => ({
      id: competition.id,
      title: competition.name,
      date: new Date(competition.date),
      type: "competition" as const,
      time: competition.time,
    })),
  ];

  // Get events for selected date
  const selectedDateEvents = events.filter(
    (event) =>
      event.date.toISOString().split("T")[0] ===
      selectedDate?.toISOString().split("T")[0]
  );

  // Filter and sort events for the list
  let filteredEvents = [...events];
  if (selectedTheme) {
    filteredEvents = filteredEvents.filter((event) => event.theme === selectedTheme);
  }

  filteredEvents.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEventClick = (event: Event) => {
    if (event.type === "workout") {
      navigate(`/coach/programs/${programId}/workouts/${event.id}/edit`);
    } else {
      navigate(`/coach/programs/${programId}/competitions/${event.id}/edit`);
    }
  };

  const handleViewAllWorkouts = () => {
    navigate(`/coach/programs/${programId}/workouts`);
  };

  const themeOptions = [
    { value: "aerobic", label: "Aérobie" },
    { value: "anaerobic-alactic", label: "Anaérobie alactique" },
    { value: "anaerobic-lactic", label: "Anaérobie lactique" },
    { value: "strength", label: "Force" },
    { value: "technical", label: "Technique" },
    { value: "mobility", label: "Mobilité" },
    { value: "plyometric", label: "Pliométrie" },
  ];

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
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {event.type === "workout" ? (
                        <Timer className="h-4 w-4" />
                      ) : (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      )}
                      <span>{event.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEventClick(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {event.time && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Heure : {event.time}
                    </p>
                  )}
                  {event.description && (
                    <p className="text-sm">{event.description}</p>
                  )}
                  {event.type === "workout" && event.theme && (
                    <p className="text-sm mt-2">
                      Type : {themeOptions.find(t => t.value === event.theme)?.label}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Liste des séances</h2>
          <div className="flex gap-2">
            <Select value={selectedTheme || ""} onValueChange={setSelectedTheme}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Type de séance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les types</SelectItem>
                {themeOptions.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? (
                <ArrowUp className="h-4 w-4 mr-2" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-2" />
              )}
              Date
            </Button>
            <Button onClick={handleViewAllWorkouts}>
              <Eye className="h-4 w-4 mr-2" />
              Voir toutes les séances
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {paginatedEvents.map((event) => {
            const Icon = event.type === "workout" ? Timer : Trophy;
            return (
              <div
                key={event.id}
                className={cn(
                  "p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer",
                  event.type === "workout" && event.theme && `border-theme-${event.theme}`
                )}
                onClick={() => handleEventClick(event)}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn(
                    "h-5 w-5",
                    event.type === "workout" && event.theme && `text-theme-${event.theme}`
                  )} />
                  <h3 className="font-semibold">{event.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(event.date).toLocaleDateString()} à {event.time || "Non défini"}
                </p>
                {event.type === "workout" && (
                  <p className="text-sm">
                    {themeOptions.find(t => t.value === event.theme)?.label}
                  </p>
                )}
              </div>
            );
          })}
          {filteredEvents.length === 0 && (
            <p className="text-center text-muted-foreground">Aucune séance créée</p>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};