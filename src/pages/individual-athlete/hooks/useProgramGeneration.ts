
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { FormValues } from "../types/programTypes";
import { Database } from "@/integrations/supabase/types";

type SprintDistance = Database['public']['Enums']['sprint_distance'];

export const useProgramGeneration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const generateProgram = async (data: FormValues, selectedPhaseLabel: string) => {
    if (!user) return;

    try {
      console.log("Creating program with data:", data);

      // Cast mainDistance to SprintDistance to ensure type safety
      const mainDistance = data.mainDistance as SprintDistance;

      // 1. Créer le programme
      const { data: programData, error: programError } = await supabase.from("programs").insert([
        {
          user_id: user.id,
          name: `Programme ${mainDistance}m - ${selectedPhaseLabel}`,
          objectives: data.objective,
          main_distance: mainDistance,
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
      console.log("Program created:", programData);

      // 2. Récupérer les templates de séances correspondant au nombre de sessions par semaine
      const { data: workoutTemplates, error: templatesError } = await supabase
        .from("workout_templates")
        .select("*")
        .eq('sessions_per_week', data.trainingDays.length)
        .eq('training_phase', data.trainingPhase)
        .eq('distance', mainDistance);

      if (templatesError) throw templatesError;
      console.log("Workout templates found:", workoutTemplates);

      // 3. Créer les séances pour chaque semaine du programme
      const workouts = [];
      const programDuration = parseInt(data.phaseDuration);
      const startDate = new Date(data.startDate);

      // Grouper les templates par type de semaine
      const templatesByWeekType = workoutTemplates.reduce((acc, template) => {
        if (!acc[template.week_type]) {
          acc[template.week_type] = [];
        }
        acc[template.week_type].push(template);
        return acc;
      }, {} as { [key: string]: typeof workoutTemplates });

      console.log("Templates by week type:", templatesByWeekType);

      // Pour chaque semaine du programme
      for (let week = 0; week < programDuration; week++) {
        // Alterner entre les types de semaine A et B
        const weekType = week % 2 === 0 ? 'A' : 'B';
        const weekTemplates = templatesByWeekType[weekType] || [];
        
        console.log(`Creating workouts for week ${week + 1}, type ${weekType}`);

        // Trier les templates par ordre de séquence
        weekTemplates.sort((a, b) => a.sequence_order - b.sequence_order);

        // Pour chaque jour d'entraînement de la semaine
        for (let dayIndex = 0; dayIndex < data.trainingDays.length; dayIndex++) {
          const template = weekTemplates[dayIndex];
          if (!template) continue;

          const workoutDate = new Date(startDate);
          workoutDate.setDate(startDate.getDate() + (week * 7) + dayIndex);

          workouts.push({
            program_id: programData.id,
            title: template.title,
            theme: template.theme,
            description: template.description,
            type: template.type,
            phase: template.phase,
            recovery: template.recovery,
            intensity: template.intensity,
            details: template.details,
            date: workoutDate.toISOString(),
            time: "09:00",
          });
        }
      }

      console.log("Workouts to create:", workouts);

      // 4. Insérer toutes les séances
      if (workouts.length > 0) {
        const { error: workoutsError } = await supabase
          .from("workouts")
          .insert(workouts);

        if (workoutsError) throw workoutsError;
      }

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

  return { generateProgram };
};
