
import { useState, useEffect } from "react";
import { WeatherData } from "./types";
import { getMeteoFranceData } from "./meteoFranceApi";
import { mockWeatherData } from "./utils";

export const useWeather = (initialLocation: string = "Paris") => {
  const [location, setLocation] = useState<string>(initialLocation);
  const [customLocation, setCustomLocation] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [useRealData, setUseRealData] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les données météo
  const fetchWeatherData = async (loc: string, dt: Date) => {
    setLoading(true);
    setError(null);
    try {
      let data: WeatherData;
      
      if (useRealData) {
        try {
          // Essayer d'utiliser l'API Météo France
          data = await getMeteoFranceData(loc, dt);
        } catch (apiError) {
          console.error("Erreur avec l'API Météo France, utilisation des données simulées:", apiError);
          // En cas d'échec, utiliser les données simulées
          data = await mockWeatherData(loc, dt);
        }
      } else {
        // Utiliser explicitement les données simulées
        data = await mockWeatherData(loc, dt);
      }
      
      setWeatherData(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Impossible de récupérer les données météo. Veuillez réessayer plus tard.");
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
  }, [location, date, useRealData]);

  // Gérer la sélection d'une localisation personnalisée
  const handleLocationInput = () => {
    if (customLocation.trim() !== "") {
      setLocation(customLocation);
      setShowCustomInput(false);
    }
  };

  // Basculer entre données réelles et simulées
  const toggleDataSource = () => {
    setUseRealData(prev => !prev);
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
    handleLocationInput,
    useRealData,
    toggleDataSource,
    error
  };
};
