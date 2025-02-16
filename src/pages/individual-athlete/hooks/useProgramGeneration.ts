
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

      // Map training phase values
      const trainingPhaseMap: { [key: string]: string } = {
        'preparation_generale': 'general',
        'preparation_specifique': 'specific',
        'preparation_competition_mid': 'competition',
        'preparation_competition_end': 'competition',
        'championnat': 'championship'
      };

      const mainDistance = data.mainDistance as SprintDistance;
      const mappedTrainingPhase = trainingPhaseMap[data.trainingPhase] || data.trainingPhase;

      // 1. Créer le programme
      const { data: programData, error: programError } = await supabase.from("programs").insert([
        {
          user_id: user.id,
          name: `Programme ${mainDistance}m - ${selectedPhaseLabel}`,
          objectives: data.objective || `Préparation ${mainDistance}m - ${selectedPhaseLabel}`,
          main_distance: mainDistance,
          training_phase: mappedTrainingPhase,
          phase_duration: parseInt(data.phaseDuration),
          main_competition: data.mainCompetition,
          intermediate_competitions: data.intermediateCompetitions,
          generated: true,
          start_date: data.startDate.toISOString(),
          duration: parseInt(data.phaseDuration) * 7,
          training_days: data.trainingDays,
          sessions_per_week: data.trainingDays.length,
        },
      ]).select().single();

      if (programError) throw programError;
      console.log("Program created:", programData);

      // 2. Générer les séances avec DeepSeek
      const { data: generatedWorkouts, error } = await supabase.functions.invoke('generate-workouts', {
        body: {
          objective: data.objective,
          mainDistance: mainDistance,
          trainingPhase: mappedTrainingPhase,
          phaseDuration: data.phaseDuration,
          sessionsPerWeek: data.trainingDays.length,
          startDate: data.startDate,
          mainCompetition: data.mainCompetition
        }
      });

      if (error) throw error;
      console.log("Generated workouts:", generatedWorkouts);

      // Helper function pour obtenir la prochaine date pour un jour spécifique
      const getNextDayDate = (date: Date, targetDay: string) => {
        const daysMap: { [key: string]: number } = {
          'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
          'friday': 5, 'saturday': 6, 'sunday': 0
        };
        
        const targetDayNum = daysMap[targetDay.toLowerCase()];
        const currentDay = date.getDay();
        let daysToAdd = targetDayNum - currentDay;
        
        if (daysToAdd <= 0) {
          daysToAdd += 7;
        }
        
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + daysToAdd);
        return nextDate;
      };

      // 3. Créer les séances générées
      const workouts = [];
      const programDuration = parseInt(data.phaseDuration);
      const startDate = new Date(data.startDate);

      // Pour chaque semaine du programme
      for (let week = 0; week < programDuration; week++) {
        // Calculer la date de début de la semaine
        const weekStartDate = new Date(startDate);
        weekStartDate.setDate(startDate.getDate() + (week * 7));

        // Pour chaque jour d'entraînement de la semaine
        data.trainingDays.forEach((trainingDay, index) => {
          const workout = generatedWorkouts.workouts[index % generatedWorkouts.workouts.length];
          const workoutDate = getNextDayDate(weekStartDate, trainingDay);

          workouts.push({
            program_id: programData.id,
            title: workout.title,
            theme: workout.theme,
            description: workout.description,
            details: workout.details,
            recovery: workout.recovery,
            intensity: workout.intensity,
            date: workoutDate.toISOString(),
            time: "09:00",
          });
        });
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

      navigate(`/individual-athlete/programs/${programData.id}/workouts`);
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
