
import { Event } from "../types";
import { parseISO } from "date-fns";

type UseEventsProps = {
  workouts: any[];
  competitions: any[];
};

export const useEvents = ({ workouts, competitions }: UseEventsProps): Event[] => {
  console.log("Raw workouts in useEvents:", workouts);
  console.log("Raw competitions in useEvents:", competitions);

  // Protection renforcée contre les entrées invalides
  const safeWorkouts = Array.isArray(workouts) ? workouts : [];
  const safeCompetitions = Array.isArray(competitions) ? competitions : [];

  try {
    const events = [
      ...safeWorkouts.map((workout) => {
        try {
          if (!workout) return null;
          
          // Utilisation de parseISO pour une meilleure gestion des dates ISO
          let date: Date;
          
          try {
            // Vérification plus stricte des formats de date
            if (typeof workout.date === 'string' && workout.date.trim() !== '') {
              date = parseISO(workout.date);
              
              // Vérifie si la date est valide
              if (isNaN(date.getTime())) {
                console.error("Invalid date string for workout:", workout.date);
                date = new Date(); // Fallback à la date actuelle
              }
            } else if (workout.date instanceof Date && !isNaN(workout.date.getTime())) {
              date = workout.date;
            } else {
              console.error("Invalid date format for workout:", workout);
              date = new Date(); // Fallback à la date actuelle
            }
          } catch (error) {
            console.error("Error parsing date for workout:", workout, error);
            date = new Date(); // Fallback à la date actuelle
          }
          
          // On s'assure que les détails sont dans un format valide
          const details = typeof workout.details === 'string' ? workout.details : '';
          
          return {
            id: workout.id || '',
            title: workout.title || '',
            date: date,
            type: "workout" as const,
            theme: workout.theme || null,
            description: workout.description || '',
            time: workout.time || '',
            details: details,
            phase: workout.phase || null,
            intensity: workout.intensity || null,
            recovery: workout.recovery || '',
          };
        } catch (error) {
          console.error("Error processing workout:", workout, error);
          return null;
        }
      }).filter(Boolean) || [],
      
      ...safeCompetitions.map((competition) => {
        try {
          if (!competition) return null;

          // Utilisation de parseISO pour une meilleure gestion des dates ISO
          let date: Date;
          
          try {
            // Vérification plus stricte des formats de date
            if (typeof competition.date === 'string' && competition.date.trim() !== '') {
              date = parseISO(competition.date);
              
              // Vérifie si la date est valide
              if (isNaN(date.getTime())) {
                console.error("Invalid date string for competition:", competition.date);
                date = new Date(); // Fallback à la date actuelle
              }
            } else if (competition.date instanceof Date && !isNaN(competition.date.getTime())) {
              date = competition.date;
            } else {
              console.error("Invalid date format for competition:", competition);
              date = new Date(); // Fallback à la date actuelle
            }
          } catch (error) {
            console.error("Error parsing date for competition:", competition, error);
            date = new Date(); // Fallback à la date actuelle
          }

          return {
            id: competition.id || '',
            title: competition.name || '',
            date: date,
            type: "competition" as const,
            time: competition.time || '',
            location: competition.location || '',
            distance: competition.distance || '',
            level: competition.level || '',
          };
        } catch (error) {
          console.error("Error processing competition:", competition, error);
          return null;
        }
      }).filter(Boolean) || [],
    ];

    console.log("Processed events:", events);
    return events;
  } catch (error) {
    console.error("Critical error in useEvents:", error);
    return []; // En cas d'erreur critique, retourner un tableau vide
  }
};
