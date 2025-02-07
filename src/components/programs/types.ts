
export type Event = {
  id: string;
  title: string;
  date: Date;
  type: "workout" | "competition";
  theme?: string;
  description?: string;
  time?: string;
  details?: any;
  location?: string;
  distance?: string;
  level?: string;
  phase?: string;
  intensity?: string;
  recovery?: string;
};

export type ThemeOption = {
  value: string;
  label: string;
};

export type WorkoutPhase = "preparation" | "specific" | "competition";
export type WorkoutType = "resistance" | "speed" | "endurance" | "mobility" | "technical";
