
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { BasicProgramInfo } from "./components/program-generator/BasicProgramInfo";
import { TrainingDays } from "./components/program-generator/TrainingDays";
import { CompetitionInfo } from "./components/program-generator/CompetitionInfo";

export type Competition = {
  name: string;
  date: string;
  location: string;
};

export type FormValues = {
  objective: string;
  mainDistance: string;
  trainingPhase: string;
  phaseDuration: string;
  startDate: Date;
  mainCompetition: Competition;
  intermediateCompetitions: Competition[];
  trainingDays: string[];
};

const PHASE_OPTIONS = [
  { value: "preparation_generale", label: "Phase de préparation générale", durations: ["2", "3", "4"] },
  { value: "preparation_specifique", label: "Phase de préparation spécifique", durations: ["2", "3", "4"] },
  { value: "preparation_competition_mid", label: "Phase de préparation de compétition (mi-saison)", durations: ["2", "3"] },
  { value: "preparation_competition_end", label: "Phase de préparation de compétition (fin de saison)", durations: ["2", "3"] },
  { value: "championnat", label: "Phase de championnat", durations: ["4"] },
];

const DISTANCE_OPTIONS = [
  { value: "60", label: "60m" },
  { value: "100", label: "100m" },
  { value: "200", label: "200m" },
  { value: "400", label: "400m" },
];

const DAYS_OF_WEEK = [
  { value: "monday", label: "Lun" },
  { value: "tuesday", label: "Mar" },
  { value: "wednesday", label: "Mer" },
  { value: "thursday", label: "Jeu" },
  { value: "friday", label: "Ven" },
  { value: "saturday", label: "Sam" },
  { value: "sunday", label: "Dim" },
];

const GenerateProgram = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const form = useForm<FormValues>({
    defaultValues: {
      objective: "",
      mainDistance: "",
      trainingPhase: "",
      phaseDuration: "",
      startDate: new Date(),
      mainCompetition: {
        name: "",
        date: "",
        location: "",
      },
      intermediateCompetitions: [],
      trainingDays: [],
    },
  });

  const selectedPhase = PHASE_OPTIONS.find(
    (phase) => phase.value === form.watch("trainingPhase")
  );

  const onSubmit = async (data: FormValues) => {
    if (!user) return;

    try {
      // 1. Créer le programme
      const { data: programData, error: programError } = await supabase.from("programs").insert([
        {
          user_id: user.id,
          name: `Programme ${data.mainDistance}m - ${selectedPhase?.label}`,
          objectives: data.objective,
          main_distance: data.mainDistance,
          training_phase: data.trainingPhase,
          phase_duration: parseInt(data.phaseDuration),
          main_competition: data.mainCompetition,
          intermediate_competitions: data.intermediateCompetitions,
          generated: true,
          start_date: data.startDate.toISOString(),
          duration: parseInt(data.phaseDuration) * 7, // Convertir les semaines en jours
          training_days: data.trainingDays,
          sessions_per_week: data.trainingDays.length,
        },
      ]).select().single();

      if (programError) throw programError;

      // 2. Récupérer les templates de séances correspondant au nombre de sessions par semaine
      const { data: workoutTemplates, error: templatesError } = await supabase
        .from("workouts")
        .select("*")
        .ilike('title', `%(${data.trainingDays.length}/semaine)%`)
        .is('program_id', null); // S'assurer que nous ne récupérons que les templates

      if (templatesError) throw templatesError;

      console.log("Templates de séances trouvés:", workoutTemplates);

      // 3. Créer les séances pour chaque semaine du programme
      const workouts = [];
      const programDuration = parseInt(data.phaseDuration);
      const startDate = new Date(data.startDate);

      for (let week = 0; week < programDuration; week++) {
        // Pour chaque template de séance
        for (let i = 0; i < workoutTemplates.length; i++) {
          const template = workoutTemplates[i];
          const dayIndex = i % data.trainingDays.length;
          const workoutDate = new Date(startDate);
          workoutDate.setDate(startDate.getDate() + (week * 7) + dayIndex);

          workouts.push({
            program_id: programData.id,
            title: template.title.replace(` (${data.trainingDays.length}/semaine)`, ''),
            theme: template.theme,
            description: template.description,
            recovery: template.recovery,
            phase: template.phase,
            type: template.type,
            date: workoutDate.toISOString(),
            time: "09:00",
          });
        }
      }

      console.log("Séances à créer:", workouts);

      // 4. Insérer toutes les séances
      const { error: workoutsError } = await supabase
        .from("workouts")
        .insert(workouts);

      if (workoutsError) throw workoutsError;

      toast({
        title: "Programme créé avec succès",
        description: "Votre programme d'entraînement a été généré.",
      });

      navigate("/individual-athlete/planning");
    } catch (error) {
      console.error("Error creating program:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du programme.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/individual-athlete/planning")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Générer un programme</h1>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicProgramInfo 
              form={form} 
              DISTANCE_OPTIONS={DISTANCE_OPTIONS} 
              PHASE_OPTIONS={PHASE_OPTIONS} 
            />

            {selectedPhase && (
              <TrainingDays 
                form={form} 
                DAYS_OF_WEEK={DAYS_OF_WEEK} 
              />
            )}

            <Separator className="my-6" />

            <CompetitionInfo form={form} />

            <Button type="submit" className="w-full">
              Générer le programme
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default GenerateProgram;
