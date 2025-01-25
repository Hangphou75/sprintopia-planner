export type Event = {
  id: string;
  title: string;
  date: Date;
  type: "workout" | "competition";
  theme?: string;
  description?: string;
  time?: string;
  details?: any;
};

export type ThemeOption = {
  value: string;
  label: string;
};