
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, Award, ArrowRight } from "lucide-react";

// Mock data
const PROGRAMS = [
  {
    id: "1",
    title: "Préparation Marathon",
    startDate: "2025-02-15",
    endDate: "2025-05-15",
    type: "running",
    status: "active",
    workoutsCount: 24,
    competition: "Marathon de Paris"
  },
  {
    id: "2",
    title: "Renforcement Musculaire",
    startDate: "2025-06-01",
    endDate: "2025-07-15",
    type: "strength",
    status: "upcoming",
    workoutsCount: 12,
    competition: null
  },
  {
    id: "3",
    title: "Préparation Semi-Marathon",
    startDate: "2024-09-01",
    endDate: "2024-11-01",
    type: "running",
    status: "completed",
    workoutsCount: 18,
    competition: "Semi-Marathon de Paris"
  }
];

const Programs = () => {
  const [activeTab, setActiveTab] = useState("active");
  
  const filteredPrograms = PROGRAMS.filter(program => {
    if (activeTab === "all") return true;
    return program.status === activeTab;
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Mes programmes</h1>
      </div>
      
      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="active">Actifs</TabsTrigger>
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="completed">Terminés</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <Link key={program.id} to={`/athlete/programs/${program.id}/workouts`}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-start">
                      <div className="text-xl">{program.title}</div>
                      {program.status === "active" && (
                        <Badge className="bg-green-100 text-green-800">Actif</Badge>
                      )}
                      {program.status === "upcoming" && (
                        <Badge variant="outline">À venir</Badge>
                      )}
                      {program.status === "completed" && (
                        <Badge variant="secondary">Terminé</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CalendarClock className="mr-2 h-4 w-4 opacity-70" /> 
                        <span>
                          {new Date(program.startDate).toLocaleDateString('fr-FR')} - {new Date(program.endDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      
                      {program.competition && (
                        <div className="flex items-center text-sm">
                          <Award className="mr-2 h-4 w-4 opacity-70" />
                          <span>{program.competition}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm pt-2">
                        <span className="mr-auto">{program.workoutsCount} séances</span>
                        <Button variant="ghost" size="sm" className="text-primary">
                          Voir <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Programs;
