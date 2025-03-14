
import { useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Award } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// Types
interface WorkoutFeedback {
  id: string;
  created_at: string;
  updated_at: string;
  workout_id: string;
  user_id: string;
  level: string;
  rating: number;
  perceived_difficulty: number;
  notes: string;
  user: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
  workout: {
    id: string;
    title: string;
    date: string;
    program_id: string;
    program: {
      title: string;
    }
  };
}

// Mock data
const FEEDBACKS: WorkoutFeedback[] = [
  {
    id: "1",
    created_at: "2025-05-12T10:30:00Z",
    updated_at: "2025-05-12T10:30:00Z",
    workout_id: "101",
    user_id: "201",
    level: "good",
    rating: 4,
    perceived_difficulty: 7,
    notes: "Séance très bien passée, j'ai pu maintenir le rythme prévu.",
    user: {
      first_name: "Marie",
      last_name: "Durand",
      avatar_url: ""
    },
    workout: {
      id: "101",
      title: "Endurance fondamentale",
      date: "2025-05-12",
      program_id: "301",
      program: {
        title: "Préparation Marathon"
      }
    }
  },
  {
    id: "2",
    created_at: "2025-05-11T18:15:00Z",
    updated_at: "2025-05-11T18:15:00Z",
    workout_id: "102",
    user_id: "202",
    level: "adjusted",
    rating: 3,
    perceived_difficulty: 8,
    notes: "J'ai dû réduire l'intensité à cause d'une légère douleur au mollet.",
    user: {
      first_name: "Thomas",
      last_name: "Martin",
      avatar_url: ""
    },
    workout: {
      id: "102",
      title: "Séance de VMA",
      date: "2025-05-11",
      program_id: "302",
      program: {
        title: "Préparation 10km"
      }
    }
  },
  {
    id: "3",
    created_at: "2025-05-10T09:45:00Z",
    updated_at: "2025-05-10T09:45:00Z",
    workout_id: "103",
    user_id: "203",
    level: "bad",
    rating: 1,
    perceived_difficulty: 9,
    notes: "Journée difficile, fatigue importante, je n'ai pas pu compléter la séance.",
    user: {
      first_name: "Julie",
      last_name: "Petit",
      avatar_url: ""
    },
    workout: {
      id: "103",
      title: "Côtes & renforcement",
      date: "2025-05-10",
      program_id: "303",
      program: {
        title: "Préparation Trail"
      }
    }
  },
  {
    id: "4",
    created_at: "2025-05-09T14:20:00Z",
    updated_at: "2025-05-09T14:20:00Z",
    workout_id: "104",
    user_id: "204",
    level: "canceled",
    rating: 0,
    perceived_difficulty: 0,
    notes: "Douleur au genou, j'ai préféré reporter la séance par précaution.",
    user: {
      first_name: "Lucas",
      last_name: "Dubois",
      avatar_url: ""
    },
    workout: {
      id: "104",
      title: "Fractionné long",
      date: "2025-05-09",
      program_id: "304",
      program: {
        title: "Préparation Semi-Marathon"
      }
    }
  },
];

export const WorkoutFeedbacks = () => {
  const [activeTab, setActiveTab] = useState("all");
  
  const filteredFeedbacks = activeTab === "all" 
    ? FEEDBACKS 
    : FEEDBACKS.filter(feedback => feedback.level === activeTab);

  // Data for pie chart
  const feedbackStats = [
    { name: "Bien passé", value: FEEDBACKS.filter(f => f.level === "good").length, color: "#22c55e" },
    { name: "Ajusté", value: FEEDBACKS.filter(f => f.level === "adjusted").length, color: "#eab308" },
    { name: "Mauvais", value: FEEDBACKS.filter(f => f.level === "bad").length, color: "#ef4444" },
    { name: "Annulé", value: FEEDBACKS.filter(f => f.level === "canceled").length, color: "#6b7280" },
  ];
  
  // Helper function to get badge color based on level
  const getLevelBadge = (level: string) => {
    switch (level) {
      case "good":
        return <Badge className="bg-green-100 text-green-800">Bien passé</Badge>;
      case "adjusted":
        return <Badge className="bg-yellow-100 text-yellow-800">Ajusté</Badge>;
      case "bad":
        return <Badge className="bg-red-100 text-red-800">Mauvais</Badge>;
      case "canceled":
        return <Badge variant="outline">Annulé</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Feedbacks des séances</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vue d'ensemble des feedbacks</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={feedbackStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {feedbackStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} séances`, 'Quantité']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total des feedbacks</p>
                <p className="text-2xl font-bold">{FEEDBACKS.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Séances bien passées</p>
                <p className="text-2xl font-bold text-green-600">
                  {FEEDBACKS.filter(f => f.level === "good").length}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    ({((FEEDBACKS.filter(f => f.level === "good").length / FEEDBACKS.length) * 100).toFixed(0)}%)
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Séances ajustées</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {FEEDBACKS.filter(f => f.level === "adjusted").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Séances annulées</p>
                <p className="text-2xl font-bold text-gray-500">
                  {FEEDBACKS.filter(f => f.level === "canceled").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="good">Bien passé</TabsTrigger>
          <TabsTrigger value="adjusted">Ajusté</TabsTrigger>
          <TabsTrigger value="bad">Mauvais</TabsTrigger>
          <TabsTrigger value="canceled">Annulé</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {filteredFeedbacks.map((feedback) => (
              <Link 
                key={feedback.id} 
                to={`/coach/programs/${feedback.workout.program_id}/workouts/${feedback.workout_id}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={feedback.user.avatar_url} alt={`${feedback.user.first_name} ${feedback.user.last_name}`} />
                          <AvatarFallback>
                            {feedback.user.first_name[0]}{feedback.user.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg">
                              {feedback.user.first_name} {feedback.user.last_name}
                            </h3>
                            {getLevelBadge(feedback.level)}
                          </div>
                          
                          <div className="text-sm text-muted-foreground mt-1">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>
                                  {format(parseISO(feedback.created_at), 'd MMMM yyyy', { locale: fr })}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>
                                  {format(parseISO(feedback.created_at), 'HH:mm', { locale: fr })}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <h4 className="font-medium">
                              {feedback.workout.title}
                            </h4>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Award className="h-4 w-4 mr-1" />
                              <span>{feedback.workout.program.title}</span>
                            </div>
                          </div>
                          
                          {feedback.notes && (
                            <div className="mt-2 text-sm bg-muted p-3 rounded-md">
                              {feedback.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
