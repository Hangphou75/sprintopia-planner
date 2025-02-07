
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { FormValues } from "../types/programTypes";

export const useProgramGeneration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const generateProgram = async (data: FormValues, selectedPhaseLabel: string) => {
    if (!user) return;

    try {
      // 1. Créer le programme
      const { data: programData, error: programError } = await supabase.from("programs").insert([
        {
          user_id: user.id,
          name: `Programme ${data.mainDistance}m - ${selectedPhaseLabel}`,
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
        .is('program_id', null);

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

  return { generateProgram };
};
