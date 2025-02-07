
import { Event } from "../types";

type UseEventsProps = {
  workouts: any[];
  competitions: any[];
};

export const useEvents = ({ workouts, competitions }: UseEventsProps): Event[] => {
  console.log("Raw workouts in useEvents:", workouts);
  console.log("Raw competitions in useEvents:", competitions);

  const events = [
    ...(workouts?.map((workout) => ({
      id: workout.id,
      title: workout.title,
      date: new Date(workout.date),
      type: "workout" as const,
      theme: workout.theme,
      description: workout.description,
      time: workout.time,
      details: workout.details,
      phase: workout.phase,
      intensity: workout.intensity,
      recovery: workout.recovery,
    })) || []),
    ...(competitions?.map((competition) => ({
      id: competition.id,
      title: competition.name,
      date: new Date(competition.date),
      type: "competition" as const,
      time: competition.time,
      location: competition.location,
      distance: competition.distance,
      level: competition.level,
    })) || []),
  ];

  console.log("Processed events:", events);
  return events;
};
