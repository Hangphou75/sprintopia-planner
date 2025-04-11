
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sun, Cloud, CloudRain, CloudSnow, CloudFog, Wind, Thermometer, Droplets, AlertTriangle, Sunrise, Sun as SunIcon, Sunset } from "lucide-react";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";

// Types pour les données météo
interface DayPart {
  temperature: number;
  condition: string;
  description: string;
  time: string;
}

interface WeatherData {
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

// Fonction pour obtenir l'icône correspondant à la condition météo
const getWeatherIcon = (condition: string) => {
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

// Liste des villes françaises populaires
const popularCities = [
  "Paris",
  "Marseille",
  "Lyon",
  "Toulouse",
  "Nice",
  "Nantes",
  "Strasbourg",
  "Montpellier",
  "Bordeaux",
  "Lille",
  "Rennes",
  "Reims",
];

export const WeatherWidget = () => {
  const [location, setLocation] = useState<string>("Paris");
  const [customLocation, setCustomLocation] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  // Fonction pour simuler la récupération des données météo
  // Dans un environnement de production, cela serait remplacé par un appel API réel
  const fetchWeatherData = async (location: string, date: Date) => {
    setLoading(true);

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
      date: format(date, 'dd/MM/yyyy'),
      morning,
      noon,
      evening,
      humidity: Math.floor(Math.random() * 50) + 30,
      windSpeed: parseFloat((Math.random() * 30).toFixed(1)),
      description: getRandomDescription(),
      condition: randomCondition
    };

    setWeatherData(mockData);
    setLoading(false);
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
          {/* Sélecteur de localisation */}
          <div className="space-y-2">
            {!showCustomInput ? (
              <div className="w-full">
                <Select 
                  value={location} 
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setShowCustomInput(true);
                    } else {
                      setLocation(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une ville" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Autre ville...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Saisir une ville"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full"
                />
                <div className="flex space-x-2 items-center justify-between">
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleLocationInput}>
                      Ok
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowCustomInput(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                  
                  {/* Sélecteur de date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        {format(date, 'dd/MM/yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => date && setDate(date)}
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {!showCustomInput && (
              <div className="flex justify-end">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      {format(date, 'dd/MM/yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

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
                {/* Matin */}
                <div className="bg-accent/30 rounded-lg p-2 text-center">
                  <div className="flex justify-center items-center">
                    <Sunrise className="h-4 w-4 text-orange-400 mr-1" />
                    <span className="text-xs font-medium">Matin</span>
                  </div>
                  <div className="flex justify-center my-1">
                    {getWeatherIcon(weatherData.morning.condition)}
                  </div>
                  <div className="text-lg font-bold">{weatherData.morning.temperature}°C</div>
                  <div className="text-xs truncate">{weatherData.morning.description}</div>
                </div>
                
                {/* Midi */}
                <div className="bg-accent/50 rounded-lg p-2 text-center">
                  <div className="flex justify-center items-center">
                    <SunIcon className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-xs font-medium">Midi</span>
                  </div>
                  <div className="flex justify-center my-1">
                    {getWeatherIcon(weatherData.noon.condition)}
                  </div>
                  <div className="text-lg font-bold">{weatherData.noon.temperature}°C</div>
                  <div className="text-xs truncate">{weatherData.noon.description}</div>
                </div>
                
                {/* Soir */}
                <div className="bg-accent/30 rounded-lg p-2 text-center">
                  <div className="flex justify-center items-center">
                    <Sunset className="h-4 w-4 text-red-400 mr-1" />
                    <span className="text-xs font-medium">Soir</span>
                  </div>
                  <div className="flex justify-center my-1">
                    {getWeatherIcon(weatherData.evening.condition)}
                  </div>
                  <div className="text-lg font-bold">{weatherData.evening.temperature}°C</div>
                  <div className="text-xs truncate">{weatherData.evening.description}</div>
                </div>
              </div>
              
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
