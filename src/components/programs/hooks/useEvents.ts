
import { Event } from "../types";

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
        const date = workout.date ? new Date(workout.date) : new Date();
        // Vérifie si la date est valide
        if (isNaN(date.getTime())) {
          console.error("Invalid date for workout:", workout);
          return null;
        }
        
        return {
          id: workout.id,
          title: workout.title,
          date: date,
          type: "workout" as const,
          theme: workout.theme,
          description: workout.description,
          time: workout.time || "",
          details: workout.details,
          phase: workout.phase,
          intensity: workout.intensity,
          recovery: workout.recovery,
        };
      } catch (error) {
        console.error("Error processing workout:", workout, error);
        return null;
      }
    }).filter(Boolean) || []),
    ...(competitions?.map((competition) => {
      try {
        const date = competition.date ? new Date(competition.date) : new Date();
        // Vérifie si la date est valide
        if (isNaN(date.getTime())) {
          console.error("Invalid date for competition:", competition);
          return null;
        }

        return {
          id: competition.id,
          title: competition.name,
          date: date,
          type: "competition" as const,
          time: competition.time || "",
          location: competition.location,
          distance: competition.distance,
          level: competition.level,
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
