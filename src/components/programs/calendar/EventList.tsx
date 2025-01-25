import { Button } from "@/components/ui/button";
import { Timer, Trophy, Eye, Copy, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type EventListProps = {
  events: Event[];
  themeOptions: ThemeOption[];
  currentPage: number;
  totalPages: number;
  onEventClick: (event: Event) => void;
  onPageChange: (page: number) => void;
  onViewAllClick: () => void;
  onDuplicateEvent?: (event: Event) => void;
  onDeleteEvent?: (event: Event) => void;
};

export const EventList = ({
  events,
  themeOptions,
  currentPage,
  totalPages,
  onEventClick,
  onPageChange,
  onViewAllClick,
  onDuplicateEvent,
  onDeleteEvent,
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
                "p-4 border rounded-lg hover:border-primary transition-colors",
                event.type === "workout" && event.theme && `border-theme-${event.theme}`
              )}
            >
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => onEventClick(event)}
                >
                  <Icon className={cn(
                    "h-5 w-5",
                    event.type === "workout" && event.theme && `text-theme-${event.theme}`
                  )} />
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()} à {event.time || "Non défini"}
                    </p>
                    {event.type === "workout" && event.theme && (
                      <p className="text-sm">
                        {themeOptions.find(t => t.value === event.theme)?.label}
                      </p>
                    )}
                  </div>
                </div>
                {event.type === "workout" && (
                  <div className="flex gap-2">
                    {onDuplicateEvent && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDuplicateEvent(event)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                    {onDeleteEvent && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. La séance sera définitivement supprimée.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteEvent(event)}
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                )}
              </div>
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