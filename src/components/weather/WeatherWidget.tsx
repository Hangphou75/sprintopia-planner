
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sunrise, Sun, Sunset, AlertTriangle } from "lucide-react";
import { useWeather } from "./useWeather";
import { getWeatherIcon } from "./utils";
import { LocationSelector } from "./LocationSelector";
import { DateSelector } from "./DateSelector";
import { DayPartForecast } from "./DayPartForecast";
import { CurrentConditions } from "./CurrentConditions";
import { Switch } from "@/components/ui/switch";

export const WeatherWidget = () => {
  const {
    location,
    setLocation,
    customLocation,
    setCustomLocation,
    date,
    setDate,
    weatherData,
    loading,
    showCustomInput,
    setShowCustomInput,
    handleLocationInput,
    useRealData,
    toggleDataSource,
    error
  } = useWeather();

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Météo</span>
          {weatherData && getWeatherIcon(weatherData.condition)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Sélecteurs de localisation et date */}
          <div className="space-y-2">
            <LocationSelector
              location={location}
              setLocation={setLocation}
              customLocation={customLocation}
              setCustomLocation={setCustomLocation}
              showCustomInput={showCustomInput}
              setShowCustomInput={setShowCustomInput}
              handleLocationInput={handleLocationInput}
            />

            {!showCustomInput && (
              <DateSelector date={date} setDate={setDate} />
            )}
          </div>

          {/* Option pour basculer entre données réelles et simulées */}
          <div className="flex items-center justify-between text-sm">
            <span>Utiliser les données Météo France</span>
            <Switch 
              checked={useRealData} 
              onCheckedChange={toggleDataSource}
            />
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="bg-red-50 text-red-500 p-2 rounded-lg flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-xs">{error}</span>
            </div>
          )}

          {/* Affichage des données météo */}
          {loading ? (
            <div className="h-24 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : weatherData ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-xl font-semibold">{weatherData.location}</div>
                <div className="text-sm text-muted-foreground">{weatherData.date}</div>
              </div>
              
              {/* Prévisions par période de la journée */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <DayPartForecast 
                  data={weatherData.morning} 
                  title="Matin"
                  icon={<Sunrise className="h-4 w-4 text-orange-400 mr-1" />}
                />
                <DayPartForecast 
                  data={weatherData.noon} 
                  title="Midi"
                  icon={<Sun className="h-4 w-4 text-yellow-500 mr-1" />}
                />
                <DayPartForecast 
                  data={weatherData.evening} 
                  title="Soir"
                  icon={<Sunset className="h-4 w-4 text-red-400 mr-1" />}
                />
              </div>
              
              <CurrentConditions weatherData={weatherData} />
              
              {/* Source des données */}
              <div className="text-xs text-right text-muted-foreground mt-2">
                Source: {useRealData ? "Météo France" : "Simulation"}
              </div>
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center">
              <p className="text-muted-foreground">Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
