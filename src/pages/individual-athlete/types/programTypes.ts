
export type Competition = {
  name: string;
  date: string;
  location: string;
};

export type FormValues = {
  objective: string;
  mainDistance: string;
  trainingPhase: string;
  phaseDuration: string;
  startDate: Date;
  mainCompetition: Competition;
  intermediateCompetitions: Competition[];
  trainingDays: string[];
};

export type PhaseOption = {
  value: string;
  label: string;
  durations: string[];
};

export type DistanceOption = {
  value: string;
  label: string;
};

export type DayOfWeek = {
  value: string;
  label: string;
};
