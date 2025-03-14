
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight, Dumbbell, Users } from "lucide-react";

// Mock data for programs
const programs = [
  {
    id: "1",
    title: "Programme de préparation Marathon",
    description: "Préparation pour le marathon de Paris",
    status: "active",
    workouts: 24,
    startDate: "2025-01-15",
    endDate: "2025-04-15",
    coach: "Jean Dupont"
  },
  {
    id: "2",
    title: "Renforcement musculaire",
    description: "Programme de renforcement général",
    status: "active",
    workouts: 12,
    startDate: "2025-02-01",
    endDate: "2025-03-15",
    coach: "Marie Martin"
  },
  {
    id: "3",
    title: "Préparation 10km",
    description: "Amélioration des performances sur 10km",
    status: "completed",
    workouts: 16,
    startDate: "2024-11-01",
    endDate: "2024-12-15",
    coach: "Pierre Dubois"
  }
];

export default function Programs() {
  const [activeTab, setActiveTab] = useState("active");
  
  const filteredPrograms = programs.filter(program => {
    if (activeTab === "all") return true;
    return program.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mes Programmes</h1>
        <div className="flex space-x-2">
          <Button 
            variant={activeTab === "active" ? "default" : "outline"} 
            onClick={() => setActiveTab("active")}
          >
            Actifs
          </Button>
          <Button 
            variant={activeTab === "completed" ? "default" : "outline"} 
            onClick={() => setActiveTab("completed")}
          >
            Terminés
          </Button>
          <Button 
            variant={activeTab === "all" ? "default" : "outline"} 
            onClick={() => setActiveTab("all")}
          >
            Tous
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <Card key={program.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{program.title}</CardTitle>
                <Badge className={getStatusColor(program.status)}>
                  {program.status === "active" ? "Actif" : 
                   program.status === "completed" ? "Terminé" : program.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground mb-4">{program.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(program.startDate).toLocaleDateString('fr-FR')} - {new Date(program.endDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center">
                  <Dumbbell className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{program.workouts} séances</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Coach: {program.coach}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Link to={`/athlete/programs/${program.id}/workouts`} className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-between">
                  <span>Voir les séances</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}

        {filteredPrograms.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground mb-4">Aucun programme trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
