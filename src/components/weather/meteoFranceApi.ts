
import { WeatherData, DayPart } from "./types";

const BASE_URL = "https://webservice.meteofrance.com";

// Fonction pour obtenir le code Insee d'une ville à partir de son nom
export const searchCity = async (cityName: string): Promise<{ name: string, insee: string }[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/lieu/autocomplete?q=${encodeURIComponent(cityName)}`);
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la recherche de la ville: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.map((item: any) => ({
      name: item.nom,
      insee: item.codegeo
    }));
  } catch (error) {
    console.error("Erreur lors de la recherche de la ville:", error);
    throw error;
  }
};

// Fonction pour obtenir les prévisions météo pour une ville
export const getWeatherForecast = async (inseeCode: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/api/forecast?id=${inseeCode}`);
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des prévisions: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des prévisions:", error);
    throw error;
  }
};

// Fonction pour obtenir l'observation météo actuelle
export const getCurrentWeather = async (inseeCode: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/api/observation?id=${inseeCode}`);
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des observations: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des observations:", error);
    throw error;
  }
};

// Fonction pour convertir les données Météo France au format de notre application
export const convertMeteoFranceData = (forecastData: any, observationData: any, selectedDate: Date): WeatherData => {
  // Trouver les prévisions pour la date sélectionnée
  const formattedDate = selectedDate.toISOString().split('T')[0];
  const dailyForecast = forecastData.daily_forecast.find((day: any) => day.dt.startsWith(formattedDate));
  
  // Créer les parties de la journée (matin, midi, soir)
  const morning: DayPart = {
    temperature: dailyForecast?.T_min || observationData.observation.T,
    condition: mapWeatherCode(dailyForecast?.weather || observationData.observation.weather),
    description: getWeatherDescription(dailyForecast?.weather || observationData.observation.weather),
    time: "08:00"
  };
  
  const noon: DayPart = {
    temperature: dailyForecast?.T_max || observationData.observation.T,
    condition: mapWeatherCode(dailyForecast?.weather || observationData.observation.weather),
    description: getWeatherDescription(dailyForecast?.weather || observationData.observation.weather),
    time: "13:00"
  };
  
  const evening: DayPart = {
    temperature: dailyForecast?.T_min || observationData.observation.T,
    condition: mapWeatherCode(dailyForecast?.weather || observationData.observation.weather),
    description: getWeatherDescription(dailyForecast?.weather || observationData.observation.weather),
    time: "19:00"
  };
  
  return {
    location: forecastData.name,
    date: new Date(selectedDate).toLocaleDateString('fr-FR'),
    morning,
    noon,
    evening,
    humidity: observationData.observation.humidity || 0,
    windSpeed: observationData.observation.wind_speed || 0,
    description: getWeatherDescription(observationData.observation.weather),
    condition: mapWeatherCode(observationData.observation.weather)
  };
};

// Mapping des codes météo de Météo France vers nos conditions
export const mapWeatherCode = (weatherCode: number): string => {
  // Codes selon la documentation Météo France
  if ([0, 1].includes(weatherCode)) return "clear"; // Ensoleillé ou peu nuageux
  if ([2, 3].includes(weatherCode)) return "partly cloudy"; // Nuageux
  if ([4, 5].includes(weatherCode)) return "cloudy"; // Très nuageux
  if ([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].includes(weatherCode)) return "rainy"; // Pluie
  if ([17, 18, 19, 20, 21].includes(weatherCode)) return "snowy"; // Neige
  if ([22, 23, 24, 25, 26, 27, 28].includes(weatherCode)) return "rainy"; // Pluie et neige
  if ([30, 31, 32].includes(weatherCode)) return "foggy"; // Brouillard
  return "cloudy"; // Par défaut
};

// Descriptions en français selon les codes météo
export const getWeatherDescription = (weatherCode: number): string => {
  // Codes selon la documentation Météo France
  if (weatherCode === 0) return "Ciel dégagé";
  if (weatherCode === 1) return "Peu nuageux";
  if (weatherCode === 2) return "Nuageux";
  if (weatherCode === 3) return "Très nuageux";
  if (weatherCode === 4) return "Couvert";
  if (weatherCode === 5) return "Brouillard";
  if ([6, 7].includes(weatherCode)) return "Pluie légère";
  if ([8, 9].includes(weatherCode)) return "Pluie modérée";
  if ([10, 11].includes(weatherCode)) return "Forte pluie";
  if ([12, 13, 14].includes(weatherCode)) return "Neige légère";
  if ([15, 16].includes(weatherCode)) return "Neige modérée";
  if ([17, 18].includes(weatherCode)) return "Forte neige";
  if ([22, 23, 24, 25].includes(weatherCode)) return "Pluie et neige mêlées";
  if ([30, 31, 32].includes(weatherCode)) return "Brouillard";
  return "Conditions variables";
};

// Fonction pour obtenir les données météo complètes
export const getMeteoFranceData = async (cityName: string, date: Date): Promise<WeatherData> => {
  try {
    // Rechercher le code Insee de la ville
    const cities = await searchCity(cityName);
    
    if (!cities || cities.length === 0) {
      throw new Error(`Aucune ville trouvée pour: ${cityName}`);
    }
    
    const inseeCode = cities[0].insee;
    
    // Récupérer les prévisions et les observations
    const forecastData = await getWeatherForecast(inseeCode);
    const observationData = await getCurrentWeather(inseeCode);
    
    // Convertir et retourner les données au format de notre application
    return convertMeteoFranceData(forecastData, observationData, date);
  } catch (error) {
    console.error("Erreur lors de la récupération des données météo:", error);
    // En cas d'erreur, utiliser les données simulées comme fallback
    const { mockWeatherData } = await import("./utils");
    return mockWeatherData(cityName, date);
  }
};
