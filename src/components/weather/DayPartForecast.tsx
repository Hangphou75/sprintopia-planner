
import { DayPart } from "./types";
import { getWeatherIcon } from "./utils";

interface DayPartForecastProps {
  data: DayPart;
  title: string;
  icon: React.ReactNode;
}

export const DayPartForecast = ({ data, title, icon }: DayPartForecastProps) => {
  return (
    <div className={`${title === "Midi" ? "bg-accent/50" : "bg-accent/30"} rounded-lg p-2 text-center`}>
      <div className="flex justify-center items-center">
        {icon}
        <span className="text-xs font-medium">{title}</span>
      </div>
      <div className="flex justify-center my-1">
        {getWeatherIcon(data.condition)}
      </div>
      <div className="text-lg font-bold">{data.temperature}°C</div>
      <div className="text-xs truncate">{data.description}</div>
    </div>
  );
};
