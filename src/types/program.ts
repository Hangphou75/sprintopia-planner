export type Program = {
  id: string;
  name: string;
  duration: number;
  objectives: string | null;
  start_date: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  shared_programs?: {
    athlete: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    };
  }[];
};