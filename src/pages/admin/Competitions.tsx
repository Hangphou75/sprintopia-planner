
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Mock data
const COMPETITIONS = [
  {
    id: "1",
    title: "Championnats de France",
    date: "2025-06-15",
    location: "Paris, France",
    type: "national",
    disciplines: ["100m", "200m", "Longueur"],
    status: "upcoming"
  },
  {
    id: "2",
    title: "Meeting régional",
    date: "2025-05-22",
    location: "Lyon, France",
    type: "regional",
    disciplines: ["Javelot", "Disque", "Poids"],
    status: "upcoming"
  },
  {
    id: "3",
    title: "Compétition locale",
    date: "2025-04-10",
    location: "Marseille, France",
    type: "local",
    disciplines: ["400m", "800m", "1500m"],
    status: "completed"
  },
  {
    id: "4",
    title: "Meeting international",
    date: "2025-07-05",
    location: "Berlin, Allemagne",
    type: "international",
    disciplines: ["110m haies", "Triple saut", "Perche"],
    status: "upcoming"
  }
];

export default function Competitions() {
  const { id } = useParams();
  const [filter, setFilter] = useState("all");
  
  const filteredCompetitions = COMPETITIONS.filter(comp => {
    if (filter === "all") return true;
    if (filter === "upcoming") return comp.status === "upcoming";
    if (filter === "completed") return comp.status === "completed";
    return true;
  });

  const getStatusColor = (status: string) => {
    if (status === "upcoming") return "bg-blue-100 text-blue-800";
    if (status === "completed") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Compétitions</h1>
          <p className="text-muted-foreground">ID utilisateur: {id}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="upcoming">À venir</SelectItem>
              <SelectItem value="completed">Terminées</SelectItem>
            </SelectContent>
          </Select>
          <Button>Ajouter une compétition</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompetitions.map(competition => (
          <Card key={competition.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{competition.title}</CardTitle>
                <Badge className={getStatusColor(competition.status)}>
                  {competition.status === "upcoming" ? "À venir" : "Terminée"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 opacity-70" />
                  <span>
                    {format(new Date(competition.date), 'd MMMM yyyy', { locale: fr })}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 opacity-70" />
                  <span>{competition.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 opacity-70" />
                  <span className="capitalize">{competition.type}</span>
                </div>
                <div className="pt-2">
                  <div className="text-sm font-medium mb-1">Disciplines:</div>
                  <div className="flex flex-wrap gap-1">
                    {competition.disciplines.map(discipline => (
                      <Badge key={discipline} variant="outline" className="bg-muted">
                        {discipline}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
