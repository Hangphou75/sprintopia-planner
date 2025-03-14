
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ClipboardList, 
  Clock, 
  ListFilter
} from "lucide-react";
import { getThemeLabel } from "@/utils/themeUtils";

// Mock data
const WORKOUTS = [
  {
    id: "1",
    title: "Séance d'endurance",
    date: "2025-05-10",
    time: "08:00",
    theme: "endurance",
    intensity: "7/10",
    duration: "1h30",
    completed: true
  },
  {
    id: "2",
    title: "Séance de VMA",
    date: "2025-05-13",
    time: "18:00",
    theme: "vma",
    intensity: "9/10",
    duration: "1h00",
    completed: false
  },
  {
    id: "3",
    title: "Récupération active",
    date: "2025-05-15",
    time: "10:00",
    theme: "recovery",
    intensity: "3/10",
    duration: "45min",
    completed: false
  },
  {
    id: "4",
    title: "Renforcement musculaire",
    date: "2025-05-17",
    time: "09:00",
    theme: "strength",
    intensity: "6/10",
    duration: "1h15",
    completed: false
  }
];

export default function ProgramWorkouts() {
  const { programId } = useParams();
  const [activeTab, setActiveTab] = useState("all");
  
  const filteredWorkouts = WORKOUTS.filter(workout => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") return workout.completed;
    if (activeTab === "upcoming") return !workout.completed;
    return true;
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/athlete/programs">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Séances du programme</h1>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Programme ID: {programId}</span>
            <Badge variant="outline">Marathon de Paris</Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <ListFilter className="h-4 w-4" />
            <span>Filtres</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>Calendrier</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="completed">Terminées</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkouts.map((workout) => (
              <Link 
                key={workout.id} 
                to={`/athlete/programs/${programId}/workouts/${workout.id}`}
              >
                <Card className={`cursor-pointer border-l-4 hover:shadow-md transition-shadow ${
                  workout.theme === 'endurance' ? 'border-l-blue-500' :
                  workout.theme === 'vma' ? 'border-l-red-500' :
                  workout.theme === 'recovery' ? 'border-l-green-500' :
                  workout.theme === 'strength' ? 'border-l-purple-500' :
                  'border-l-gray-500'
                }`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-start">
                      <div className="text-xl">{workout.title}</div>
                      {workout.completed && (
                        <Badge className="bg-green-100 text-green-800">Terminée</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                        <span>
                          {format(parseISO(workout.date), 'd MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 opacity-70" />
                        <span>{workout.time} • {workout.duration}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <ClipboardList className="mr-2 h-4 w-4 opacity-70" />
                        <span>Type: {getThemeLabel(workout.theme)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <span className="mr-2 font-medium">Intensité:</span>
                        <span>{workout.intensity}</span>
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
}
