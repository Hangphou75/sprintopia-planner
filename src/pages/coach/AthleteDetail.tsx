
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, CalendarClock, Award, User, Mail, Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Profile } from "@/types/database";
import { AssignProgramDialog } from "@/components/athletes/AssignProgramDialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExtendedProgram, useAthletePrograms } from "@/hooks/useAthletePrograms";
import { Link } from "react-router-dom";

// Programme Card component pour afficher les programmes
const ProgramCard = ({ program }: { program: ExtendedProgram }) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{program.name}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div>
          <p>Durée : {program.duration} semaines</p>
          <p>Début : {format(new Date(program.start_date), "dd MMMM yyyy", { locale: fr })}</p>
          {program.objectives && <p>Objectifs : {program.objectives}</p>}
        </div>
        <div className="flex justify-end">
          <Link 
            to={`/coach/programs/${program.id}/workouts`}
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <Calendar className="h-4 w-4" />
            <span>Voir les entraînements</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const AthleteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("programs");
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  
  // Utiliser le hook useAthletePrograms pour charger les programmes de l'athlète
  const { data: programs, isLoading: programsLoading } = useAthletePrograms(id);

  useEffect(() => {
    const fetchAthleteDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();
          
        if (error) throw error;
        setAthlete(data as Profile);
      } catch (error) {
        console.error("Error fetching athlete details:", error);
        toast.error("Erreur lors du chargement des détails de l'athlète");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAthleteDetails();
  }, [id]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate("/coach/athletes")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">
          Détails de l'athlète
        </h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : athlete ? (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Profil de l'athlète</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 flex flex-col items-center">
                  {athlete.avatar_url ? (
                    <img 
                      src={athlete.avatar_url} 
                      alt={`${athlete.first_name} ${athlete.last_name}`}
                      className="w-32 h-32 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <h2 className="text-xl font-bold mt-4">{athlete.first_name} {athlete.last_name}</h2>
                  <Badge className="mt-2">{athlete.role || "athlete"}</Badge>
                </div>
                
                <div className="md:w-2/3">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>{athlete.email}</span>
                    </div>
                    {athlete.created_at && (
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>Ajouté le {format(new Date(athlete.created_at), "d MMMM yyyy", { locale: fr })}</span>
                      </div>
                    )}
                    {athlete.bio && (
                      <div>
                        <h3 className="text-md font-semibold mb-2">Biographie</h3>
                        <p className="text-muted-foreground">{athlete.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="programs" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="programs">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  Programmes
                </TabsTrigger>
                <TabsTrigger value="competitions">
                  <Award className="h-4 w-4 mr-2" />
                  Compétitions
                </TabsTrigger>
              </TabsList>
              
              {activeTab === "programs" && (
                <Button onClick={() => setIsProgramDialogOpen(true)}>
                  Assigner un programme
                </Button>
              )}
            </div>
            
            <TabsContent value="programs">
              <Card>
                <CardHeader>
                  <CardTitle>Programmes assignés</CardTitle>
                </CardHeader>
                <CardContent>
                  {programsLoading ? (
                    <div className="text-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">Chargement des programmes...</p>
                    </div>
                  ) : programs && programs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {programs.map((program) => (
                        <ProgramCard key={program.id} program={program} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>Aucun programme assigné à cet athlète.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setIsProgramDialogOpen(true)}
                      >
                        Assigner un programme
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="competitions">
              <Card>
                <CardHeader>
                  <CardTitle>Compétitions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10 text-muted-foreground">
                    Les compétitions seront affichées ici.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <AssignProgramDialog
            isOpen={isProgramDialogOpen}
            onOpenChange={setIsProgramDialogOpen}
            selectedAthlete={athlete}
          />
        </>
      ) : (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-muted-foreground">Athlète non trouvé.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate("/coach/athletes")}
              >
                Retour à la liste des athlètes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AthleteDetail;
