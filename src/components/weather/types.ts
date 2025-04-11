
// Types pour les données météo
export interface DayPart {
  temperature: number;
  condition: string;
  description: string;
  time: string;
}

export interface WeatherData {
  location: string;
  date: string;
  morning: DayPart;
  noon: DayPart;
  evening: DayPart;
  humidity: number;
  windSpeed: number;
  description: string;
  condition: string;
}
