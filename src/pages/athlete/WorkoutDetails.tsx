
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  BarChart,
  Timer,
  Heart,
  ChevronLeft,
  User,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Ban
} from "lucide-react";

// Mock data
const WORKOUT = {
  id: "1",
  title: "Séance d'endurance",
  description: "Séance d'endurance fondamentale avec un rythme régulier",
  date: "2025-05-10",
  time: "08:00",
  duration: "1h30",
  theme: "endurance",
  intensity: "7/10",
  completed: false,
  coach_notes: "Concentrez-vous sur un rythme régulier et une respiration contrôlée. Idéalement, maintenez une fréquence cardiaque modérée.",
  exercises: [
    {
      id: "ex1",
      title: "Échauffement",
      duration: "15min",
      description: "Jogging léger, mobilité articulaire et dynamisation"
    },
    {
      id: "ex2",
      title: "Corps de séance",
      duration: "1h",
      description: "Course à 70-75% FCM, rythme régulier, sur terrain plat"
    },
    {
      id: "ex3",
      title: "Retour au calme",
      duration: "15min",
      description: "Jogging très léger puis étirements passifs"
    }
  ]
};

// Feedback type declaration
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
}

// Mock feedback data
const FEEDBACK: WorkoutFeedback | null = null;

export const WorkoutDetails = () => {
  const { workoutId } = useParams();
  const [activeTab, setActiveTab] = useState("details");
  const [feedbackLevel, setFeedbackLevel] = useState<string>("good");
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Get theme label
  const getThemeLabel = (theme: string) => {
    switch (theme) {
      case "endurance": return "Endurance";
      case "vma": return "VMA";
      case "recovery": return "Récupération";
      case "strength": return "Renforcement";
      default: return theme;
    }
  };
  
  // Get theme color
  const getThemeColor = (theme: string) => {
    switch (theme) {
      case "endurance": return "border-l-blue-500";
      case "vma": return "border-l-red-500";
      case "recovery": return "border-l-green-500";
      case "strength": return "border-l-purple-500";
      default: return "border-l-gray-500";
    }
  };

  const handleSubmitFeedback = () => {
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Feedback envoyé avec succès !");
      setSubmitting(false);
      setActiveTab("details");
    }, 1000);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/athlete/planning">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{WORKOUT.title}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Workout details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={`border-l-4 ${getThemeColor(WORKOUT.theme)}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl">{WORKOUT.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Type: {getThemeLabel(WORKOUT.theme)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {WORKOUT.completed ? (
                    <Badge className="bg-green-100 text-green-800">Terminée</Badge>
                  ) : (
                    <Badge variant="outline">À venir</Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 opacity-70" />
                    <span>
                      {format(parseISO(WORKOUT.date), 'd MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 opacity-70" />
                    <span>{WORKOUT.time}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Timer className="mr-2 h-4 w-4 opacity-70" />
                    <span>Durée: {WORKOUT.duration}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <BarChart className="mr-2 h-4 w-4 opacity-70" />
                    <span>Intensité: {WORKOUT.intensity}</span>
                  </div>
                </div>
              </div>
              
              {WORKOUT.description && (
                <div className="mb-4">
                  <p className="text-sm">{WORKOUT.description}</p>
                </div>
              )}
              
              {WORKOUT.coach_notes && (
                <div className="bg-blue-50 p-3 rounded-md mb-4">
                  <div className="flex">
                    <User className="h-4 w-4 text-blue-500 mt-1 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Note du coach:</p>
                      <p className="text-sm text-blue-800">{WORKOUT.coach_notes}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h3 className="font-medium">Contenu de la séance</h3>
                {WORKOUT.exercises.map((exercise, index) => (
                  <div key={exercise.id} className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{exercise.title}</h4>
                      <span className="text-sm text-muted-foreground">{exercise.duration}</span>
                    </div>
                    <p className="text-sm mt-1">{exercise.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Résumé</TabsTrigger>
                  <TabsTrigger value="add-feedback">Ajouter un feedback</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  {FEEDBACK ? (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        {FEEDBACK.level === "good" && (
                          <div className="flex items-center text-green-600">
                            <ThumbsUp className="h-5 w-5 mr-2" />
                            <span className="font-medium">Bien passé</span>
                          </div>
                        )}
                        {FEEDBACK.level === "adjusted" && (
                          <div className="flex items-center text-yellow-600">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            <span className="font-medium">Ajusté</span>
                          </div>
                        )}
                        {FEEDBACK.level === "bad" && (
                          <div className="flex items-center text-red-600">
                            <ThumbsDown className="h-5 w-5 mr-2" />
                            <span className="font-medium">Mauvais</span>
                          </div>
                        )}
                        {FEEDBACK.level === "canceled" && (
                          <div className="flex items-center text-gray-600">
                            <Ban className="h-5 w-5 mr-2" />
                            <span className="font-medium">Annulé</span>
                          </div>
                        )}
                      </div>
                      
                      {FEEDBACK.notes && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm">{FEEDBACK.notes}</p>
                        </div>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        Feedback ajouté le {format(parseISO(FEEDBACK.created_at), 'd MMMM yyyy à HH:mm', { locale: fr })}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("add-feedback")}
                      >
                        Modifier le feedback
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">
                        Vous n'avez pas encore donné votre ressenti sur cette séance
                      </p>
                      <Button onClick={() => setActiveTab("add-feedback")}>
                        Ajouter un feedback
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="add-feedback">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Comment s'est passée cette séance ?</Label>
                      <RadioGroup 
                        value={feedbackLevel} 
                        onValueChange={setFeedbackLevel}
                        className="grid grid-cols-1 md:grid-cols-2 gap-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="good" id="good" />
                          <Label htmlFor="good" className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-2 text-green-600" />
                            Bien passé
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="adjusted" id="adjusted" />
                          <Label htmlFor="adjusted" className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                            Ajusté
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bad" id="bad" />
                          <Label htmlFor="bad" className="flex items-center">
                            <ThumbsDown className="h-4 w-4 mr-2 text-red-600" />
                            Mauvais
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="canceled" id="canceled" />
                          <Label htmlFor="canceled" className="flex items-center">
                            <Ban className="h-4 w-4 mr-2 text-gray-600" />
                            Annulé
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optionnel)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Commentaire libre sur votre séance..."
                        value={feedbackNotes}
                        onChange={(e) => setFeedbackNotes(e.target.value)}
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSubmitFeedback}
                        disabled={submitting}
                      >
                        {submitting ? "Envoi en cours..." : "Envoyer le feedback"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("details")}
                        disabled={submitting}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Meta information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Type</h3>
                  <p>{getThemeLabel(WORKOUT.theme)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Date</h3>
                  <p>{format(parseISO(WORKOUT.date), 'd MMMM yyyy', { locale: fr })}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Heure</h3>
                  <p>{WORKOUT.time}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Durée</h3>
                  <p>{WORKOUT.duration}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Intensité</h3>
                  <p>{WORKOUT.intensity}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Statut</h3>
                  <p className="flex items-center">
                    {WORKOUT.completed ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                        <span>Terminée</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-blue-600 mr-1" />
                        <span>À venir</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => setActiveTab("add-feedback")}>
                  Ajouter un feedback
                </Button>
                <Button variant="outline" className="w-full">
                  Marquer comme terminée
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
