
import { Droplets, Wind } from "lucide-react";
import { WeatherData } from "./types";

interface CurrentConditionsProps {
  weatherData: WeatherData;
}

export const CurrentConditions = ({ weatherData }: CurrentConditionsProps) => {
  return (
    <>
      <div className="bg-accent/50 rounded-lg p-3 mt-3">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">Conditions générales</div>
          <div className="text-sm">{weatherData.description}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center space-x-1">
          <Droplets className="h-4 w-4 text-blue-400" />
          <span>Humidité: {weatherData.humidity}%</span>
        </div>
        <div className="flex items-center space-x-1">
          <Wind className="h-4 w-4 text-blue-400" />
          <span>Vent: {weatherData.windSpeed} km/h</span>
        </div>
      </div>
    </>
  );
};
