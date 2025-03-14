
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { ThumbsUp, ThumbsDown, AlertTriangle, Ban, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Types
type WorkoutFeedback = {
  id: string;
  workout_id: string;
  user_id: string;
  level: "good" | "adjusted" | "bad" | "canceled";
  notes: string | null;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  workout: {
    title: string;
    date: string;
    program_id: string;
  };
};

type FeedbackStats = {
  date: string;
  good: number;
  adjusted: number;
  bad: number;
  canceled: number;
};

export const WorkoutFeedbacks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);

  // Fetch workouts with feedback for this coach's athletes
  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ["workout-feedbacks", user?.id, timeRange],
    queryFn: async () => {
      const fromDate = format(subDays(new Date(), timeRange), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("workout_feedback")
        .select(`
          *,
          user:user_id(first_name, last_name, avatar_url),
          workout:workout_id(title, date, program_id)
        `)
        .gte("created_at", fromDate)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Filter to only include feedback from this coach's athletes
      const { data: coachAthletes } = await supabase
        .from("coach_athletes")
        .select("athlete_id")
        .eq("coach_id", user?.id);
      
      const athleteIds = coachAthletes?.map(relation => relation.athlete_id) || [];
      
      return data?.filter(feedback => 
        athleteIds.includes(feedback.user_id)
      ) as WorkoutFeedback[];
    },
    enabled: !!user?.id,
  });

  // Create stats for chart
  const groupFeedbacksByDate = (feedbacks: WorkoutFeedback[] = []): FeedbackStats[] => {
    const dateMap = new Map<string, FeedbackStats>();
    
    // Initialize dates for the last N days
    for (let i = 0; i <= timeRange; i++) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      const formattedDate = format(new Date(date), "dd MMM", { locale: fr });
      dateMap.set(date, { 
        date: formattedDate, 
        good: 0, 
        adjusted: 0, 
        bad: 0, 
        canceled: 0 
      });
    }
    
    // Count feedbacks by date and type
    feedbacks.forEach(feedback => {
      const feedbackDate = format(new Date(feedback.created_at), "yyyy-MM-dd");
      
      if (dateMap.has(feedbackDate)) {
        const stats = dateMap.get(feedbackDate)!;
        stats[feedback.level] += 1;
      }
    });
    
    // Convert map to array and sort by date
    return Array.from(dateMap.values())
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
  };

  const stats = groupFeedbacksByDate(feedbacks);

  // Render feedback icon based on level
  const renderFeedbackIcon = (level: string) => {
    switch (level) {
      case "good":
        return <ThumbsUp className="h-5 w-5 text-green-500" />;
      case "adjusted":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "bad":
        return <ThumbsDown className="h-5 w-5 text-orange-500" />;
      case "canceled":
        return <Ban className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const renderFeedbackLabel = (level: string) => {
    switch (level) {
      case "good":
        return "Bonne séance";
      case "adjusted":
        return "Ajustée";
      case "bad":
        return "Difficile";
      case "canceled":
        return "Avortée";
      default:
        return level;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-muted-foreground">Chargement des feedbacks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Suivi des feedbacks athlètes</h1>
      
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="list">Liste des feedbacks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Évolution des retours</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant={timeRange === 7 ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setTimeRange(7)}
                  >
                    7 jours
                  </Button>
                  <Button 
                    variant={timeRange === 14 ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setTimeRange(14)}
                  >
                    14 jours
                  </Button>
                  <Button 
                    variant={timeRange === 30 ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setTimeRange(30)}
                  >
                    30 jours
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="good" name="Bon" fill="#22c55e" stackId="a" />
                    <Bar dataKey="adjusted" name="Ajusté" fill="#eab308" stackId="a" />
                    <Bar dataKey="bad" name="Difficile" fill="#f97316" stackId="a" />
                    <Bar dataKey="canceled" name="Avorté" fill="#ef4444" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bonnes séances</p>
                    <p className="text-2xl font-bold">
                      {feedbacks?.filter(f => f.level === "good").length || 0}
                    </p>
                  </div>
                  <ThumbsUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Séances ajustées</p>
                    <p className="text-2xl font-bold">
                      {feedbacks?.filter(f => f.level === "adjusted").length || 0}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Séances difficiles</p>
                    <p className="text-2xl font-bold">
                      {feedbacks?.filter(f => f.level === "bad").length || 0}
                    </p>
                  </div>
                  <ThumbsDown className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Séances avortées</p>
                    <p className="text-2xl font-bold">
                      {feedbacks?.filter(f => f.level === "canceled").length || 0}
                    </p>
                  </div>
                  <Ban className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Derniers feedbacks</CardTitle>
            </CardHeader>
            <CardContent>
              {feedbacks && feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <Card key={feedback.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                              {feedback.user.avatar_url ? (
                                <img 
                                  src={feedback.user.avatar_url} 
                                  alt={`${feedback.user.first_name} ${feedback.user.last_name}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-medium">
                                  {feedback.user.first_name?.[0]}{feedback.user.last_name?.[0]}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {feedback.user.first_name} {feedback.user.last_name}
                              </p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" />
                                {format(new Date(feedback.created_at), "dd MMM yyyy", { locale: fr })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderFeedbackIcon(feedback.level)}
                            <span className="text-sm font-medium">
                              {renderFeedbackLabel(feedback.level)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-muted p-3 rounded-md mb-4">
                          <p className="font-medium text-sm mb-1">Séance: {feedback.workout.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(feedback.workout.date), "dd MMMM yyyy", { locale: fr })}
                          </p>
                        </div>
                        
                        {feedback.notes && (
                          <div className="mb-4">
                            <p className="text-sm font-medium mb-1">Commentaire:</p>
                            <p className="text-sm text-muted-foreground">{feedback.notes}</p>
                          </div>
                        )}
                        
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/coach/programs/${feedback.workout.program_id}/workouts/${feedback.workout_id}`)}
                          >
                            Voir la séance
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun feedback pour le moment
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
