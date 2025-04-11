
import { Sun, Cloud, CloudRain, CloudSnow, CloudFog, Wind, AlertTriangle } from "lucide-react";
import { DayPart, WeatherData } from "./types";

// Fonction pour obtenir l'icône correspondant à la condition météo
export const getWeatherIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'sunny':
    case 'clear':
      return <Sun className="h-8 w-8 text-yellow-500" />;
    case 'cloudy':
    case 'partly cloudy':
      return <Cloud className="h-8 w-8 text-gray-400" />;
    case 'rainy':
    case 'rain':
      return <CloudRain className="h-8 w-8 text-blue-400" />;
    case 'snowy':
    case 'snow':
      return <CloudSnow className="h-8 w-8 text-blue-200" />;
    case 'foggy':
    case 'fog':
      return <CloudFog className="h-8 w-8 text-gray-300" />;
    case 'windy':
    case 'wind':
      return <Wind className="h-8 w-8 text-blue-300" />;
    default:
      return <AlertTriangle className="h-8 w-8 text-yellow-400" />;
  }
};

// Simuler la récupération des données météo
export const mockWeatherData = async (location: string, date: Date): Promise<WeatherData> => {
  // Simuler un délai d'API
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Générer des données météo aléatoires pour la démonstration
  const conditions = ['sunny', 'cloudy', 'rainy', 'partly cloudy', 'clear', 'foggy', 'windy'];
  const descriptions = [
    'Ciel dégagé', 'Partiellement nuageux', 'Pluie légère', 
    'Ensoleillé', 'Brumeux', 'Nuageux', 'Venteux'
  ];
  
  // Fonction pour générer une température en fonction de l'heure de la journée et de la saison
  const generateTemperature = (hour: number, month: number) => {
    let baseTemp = 15;
    
    // Ajuster la température en fonction de la saison
    if (month >= 5 && month <= 7) baseTemp = 25; // été
    else if (month >= 2 && month <= 4) baseTemp = 15; // printemps
    else if (month >= 8 && month <= 10) baseTemp = 15; // automne
    else baseTemp = 5; // hiver
    
    // Ajuster en fonction de l'heure
    if (hour >= 11 && hour <= 15) {
      baseTemp += 5; // Plus chaud à midi
    } else if (hour >= 17 || hour <= 6) {
      baseTemp -= 3; // Plus frais le soir/matin
    }
    
    const tempVariation = Math.random() * 6 - 3;
    return parseFloat((baseTemp + tempVariation).toFixed(1));
  };
  
  // Générer une condition météo aléatoire
  const getRandomCondition = () => {
    return conditions[Math.floor(Math.random() * conditions.length)];
  };
  
  // Générer une description météo aléatoire
  const getRandomDescription = () => {
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };
  
  const month = date.getMonth();
  const randomCondition = getRandomCondition();
  
  // Créer les données météo pour chaque partie de la journée
  const morning: DayPart = {
    temperature: generateTemperature(8, month),
    condition: getRandomCondition(),
    description: getRandomDescription(),
    time: "08:00"
  };
  
  const noon: DayPart = {
    temperature: generateTemperature(13, month),
    condition: getRandomCondition(),
    description: getRandomDescription(),
    time: "13:00"
  };
  
  const evening: DayPart = {
    temperature: generateTemperature(19, month),
    condition: getRandomCondition(),
    description: getRandomDescription(),
    time: "19:00"
  };

  const mockData: WeatherData = {
    location: location,
    date: date.toLocaleDateString('fr-FR'),
    morning,
    noon,
    evening,
    humidity: Math.floor(Math.random() * 50) + 30,
    windSpeed: parseFloat((Math.random() * 30).toFixed(1)),
    description: getRandomDescription(),
    condition: randomCondition
  };

  return mockData;
};
