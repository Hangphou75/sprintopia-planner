
export type Program = {
  id: string;
  name: string;
  duration: number;
  objectives: string | null;
  start_date: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  training_phase: string | null;
  phase_duration: number | null;
  main_distance: string | null;
  phase: string | null;
  sessions_per_week: number | null;
  training_days: string[] | null;
  main_competition: {
    name: string;
    date: string;
    location: string;
  } | null;
  intermediate_competitions: {
    name: string;
    date: string;
    location: string;
  }[] | null;
  generated: boolean | null;
  folder_id: string | null;
  shared_programs?: {
    athlete: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    };
  }[];
};
