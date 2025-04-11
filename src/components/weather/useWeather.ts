
import { useState, useEffect } from "react";
import { WeatherData } from "./types";
import { mockWeatherData } from "./utils";

export const useWeather = (initialLocation: string = "Paris") => {
  const [location, setLocation] = useState<string>(initialLocation);
  const [customLocation, setCustomLocation] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  // Fonction pour récupérer les données météo
  const fetchWeatherData = async (loc: string, dt: Date) => {
    setLoading(true);
    try {
      const data = await mockWeatherData(loc, dt);
      setWeatherData(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données météo initiales
  useEffect(() => {
    fetchWeatherData(location, date);
  }, []);

  // Mettre à jour les données météo lorsque la localisation ou la date change
  useEffect(() => {
    if (location) {
      fetchWeatherData(location, date);
    }
  }, [location, date]);

  // Gérer la sélection d'une localisation personnalisée
  const handleLocationInput = () => {
    if (customLocation.trim() !== "") {
      setLocation(customLocation);
      setShowCustomInput(false);
    }
  };

  return {
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
    handleLocationInput
  };
};
