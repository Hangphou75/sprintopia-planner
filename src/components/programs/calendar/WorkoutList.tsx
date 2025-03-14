
import { Timer, Trophy, Dumbbell, Activity, Zap, Flame } from "lucide-react";
import { ThemeOption } from "../types";
import { Event } from "../types";
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
import { Button } from "@/components/ui/button";

type WorkoutListProps = {
  filteredWorkouts: Event[];
  themeOptions: ThemeOption[];
  themeIcons: { [key: string]: any };
  onEventClick: (event: Event) => void;
  onDuplicateWorkout: (event: Event) => void;
  onDeleteWorkout: (event: Event) => void;
  onEditWorkout?: (event: Event) => void;
  userRole?: string;
};

export const WorkoutList = ({
  filteredWorkouts,
  themeOptions,
  themeIcons,
  onEventClick,
  onDuplicateWorkout,
  onDeleteWorkout,
  onEditWorkout,
  userRole,
}: WorkoutListProps) => {
  return (
    <div className="grid gap-4">
      {filteredWorkouts.map((event) => {
        const Icon = event.theme ? themeIcons[event.theme] || Timer : Timer;
        return (
          <div
            key={event.id}
            className={`p-4 border rounded-lg hover:border-primary transition-colors ${
              event.theme ? `border-theme-${event.theme}` : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => onEventClick(event)}
              >
                <Icon className={`h-5 w-5 ${
                  event.theme ? `text-theme-${event.theme}` : ''
                }`} />
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()} à {event.time || "Non défini"}
                  </p>
                  {event.theme && (
                    <p className="text-sm">
                      {themeOptions.find(t => t.value === event.theme)?.label}
                    </p>
                  )}
                </div>
              </div>
              {(userRole === 'coach' || userRole === 'individual_athlete') && (
                <div className="flex gap-2">
                  {onEditWorkout && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditWorkout(event)}
                      className="h-8 w-8"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDuplicateWorkout(event)}
                    className="h-8 w-8"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
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
                          onClick={() => onDeleteWorkout(event)}
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {filteredWorkouts.length === 0 && (
        <p className="text-center text-muted-foreground">Aucune séance créée</p>
      )}
    </div>
  );
};
