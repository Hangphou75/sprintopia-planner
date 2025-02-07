
import { PhaseOption, DistanceOption, DayOfWeek } from "../types/programTypes";

export const PHASE_OPTIONS: PhaseOption[] = [
  { value: "preparation_generale", label: "Phase de préparation générale", durations: ["2", "3", "4"] },
  { value: "preparation_specifique", label: "Phase de préparation spécifique", durations: ["2", "3", "4"] },
  { value: "preparation_competition_mid", label: "Phase de préparation de compétition (mi-saison)", durations: ["2", "3"] },
  { value: "preparation_competition_end", label: "Phase de préparation de compétition (fin de saison)", durations: ["2", "3"] },
  { value: "championnat", label: "Phase de championnat", durations: ["4"] },
];

export const DISTANCE_OPTIONS: DistanceOption[] = [
  { value: "60", label: "60m" },
  { value: "100", label: "100m" },
  { value: "200", label: "200m" },
  { value: "400", label: "400m" },
];

export const DAYS_OF_WEEK: DayOfWeek[] = [
  { value: "monday", label: "Lun" },
  { value: "tuesday", label: "Mar" },
  { value: "wednesday", label: "Mer" },
  { value: "thursday", label: "Jeu" },
  { value: "friday", label: "Ven" },
  { value: "saturday", label: "Sam" },
  { value: "sunday", label: "Dim" },
];
