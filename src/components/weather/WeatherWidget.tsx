
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sun, Cloud, CloudRain, CloudSnow, CloudFog, Wind, Thermometer, Droplets, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';

// Types pour les données météo
interface WeatherData {
  location: string;
  date: string;
  temperature: number;
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
    
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    // Calculer la température en fonction de la saison
    const month = date.getMonth();
    let baseTemp = 15;
    
    // Ajuster la température en fonction de la saison
    if (month >= 5 && month <= 7) baseTemp = 25; // été
    else if (month >= 2 && month <= 4) baseTemp = 15; // printemps
    else if (month >= 8 && month <= 10) baseTemp = 15; // automne
    else baseTemp = 5; // hiver
    
    const tempVariation = Math.random() * 10 - 5;
    const finalTemp = baseTemp + tempVariation;

    const mockData: WeatherData = {
      location: location,
      date: format(date, 'dd/MM/yyyy'),
      temperature: parseFloat(finalTemp.toFixed(1)),
      humidity: Math.floor(Math.random() * 50) + 30,
      windSpeed: parseFloat((Math.random() * 30).toFixed(1)),
      description: randomDescription,
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
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-start">
            {!showCustomInput ? (
              <div className="flex-1">
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
              <div className="flex flex-1 space-x-2">
                <Input
                  placeholder="Saisir une ville"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="flex-1"
                />
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
            )}

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
              
              <div className="bg-accent/50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">{weatherData.temperature}°C</div>
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
