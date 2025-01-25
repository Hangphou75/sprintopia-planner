import { Button } from "@/components/ui/button";
import { Timer, Trophy, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Event, ThemeOption } from "../types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type EventListProps = {
  events: Event[];
  themeOptions: ThemeOption[];
  currentPage: number;
  totalPages: number;
  onEventClick: (event: Event) => void;
  onPageChange: (page: number) => void;
  onViewAllClick: () => void;
};

export const EventList = ({
  events,
  themeOptions,
  currentPage,
  totalPages,
  onEventClick,
  onPageChange,
  onViewAllClick,
}: EventListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Liste des séances</h2>
        <Button onClick={onViewAllClick}>
          <Eye className="h-4 w-4 mr-2" />
          Voir toutes les séances
        </Button>
      </div>

      <div className="grid gap-4">
        {events.map((event) => {
          const Icon = event.type === "workout" ? Timer : Trophy;
          return (
            <div
              key={event.id}
              className={cn(
                "p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer",
                event.type === "workout" && event.theme && `border-theme-${event.theme}`
              )}
              onClick={() => onEventClick(event)}
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
        {events.length === 0 && (
          <p className="text-center text-muted-foreground">Aucune séance créée</p>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};