
import { Event } from "../types";
import { parseISO } from "date-fns";

type UseEventsProps = {
  workouts: any[];
  competitions: any[];
};

export const useEvents = ({ workouts, competitions }: UseEventsProps): Event[] => {
  console.log("Raw workouts in useEvents:", workouts);
  console.log("Raw competitions in useEvents:", competitions);

  const events = [
    ...(workouts?.map((workout) => {
      try {
        // Utilisation de parseISO pour une meilleure gestion des dates ISO
        const date = workout.date ? parseISO(workout.date) : new Date();
        
        // Vérifie si la date est valide
        if (isNaN(date.getTime())) {
          console.error("Invalid date for workout:", workout);
          return null;
        }
        
        // On s'assure que la date est bien un objet Date standard
        const standardDate = new Date(date);
        
        return {
          id: workout.id,
          title: workout.title,
          date: standardDate,
          type: "workout" as const,
          theme: workout.theme,
          description: workout.description,
          time: workout.time || "",
          details: workout.details || {},
          phase: workout.phase || null,
          intensity: workout.intensity || null,
          recovery: workout.recovery || "",
        };
      } catch (error) {
        console.error("Error processing workout:", workout, error);
        return null;
      }
    }).filter(Boolean) || []),
    ...(competitions?.map((competition) => {
      try {
        // Utilisation de parseISO pour une meilleure gestion des dates ISO
        const date = competition.date ? parseISO(competition.date) : new Date();
        
        // Vérifie si la date est valide
        if (isNaN(date.getTime())) {
          console.error("Invalid date for competition:", competition);
          return null;
        }

        // On s'assure que la date est bien un objet Date standard
        const standardDate = new Date(date);

        return {
          id: competition.id,
          title: competition.name,
          date: standardDate,
          type: "competition" as const,
          time: competition.time || "",
          location: competition.location || "",
          distance: competition.distance || "",
          level: competition.level || "",
        };
      } catch (error) {
        console.error("Error processing competition:", competition, error);
        return null;
      }
    }).filter(Boolean) || []),
  ];

  console.log("Processed events:", events);
  return events;
};
