
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
        'preparation_competition': 'championship'
      };

      // Cast mainDistance to SprintDistance to ensure type safety
      const mainDistance = data.mainDistance as SprintDistance;
      const mappedTrainingPhase = trainingPhaseMap[data.trainingPhase] || data.trainingPhase;

      // 1. Créer le programme
      const { data: programData, error: programError } = await supabase.from("programs").insert([
        {
          user_id: user.id,
          name: `Programme ${mainDistance}m - ${selectedPhaseLabel}`,
          objectives: data.objective,
          main_distance: mainDistance,
          training_phase: mappedTrainingPhase,
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
        .eq('training_phase', mappedTrainingPhase)
        .eq('distance', mainDistance);

      if (templatesError) throw templatesError;
      console.log("Workout templates found:", workoutTemplates);

      // Helper function to get the next date for a specific day of the week
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

      // Grouper les templates par type de semaine
      const templatesByWeekType = workoutTemplates.reduce((acc, template) => {
        if (!acc[template.week_type]) {
          acc[template.week_type] = [];
        }
        acc[template.week_type].push(template);
        return acc;
      }, {} as { [key: string]: typeof workoutTemplates });

      console.log("Templates by week type:", templatesByWeekType);

      // 3. Créer les séances pour chaque semaine du programme
      const workouts = [];
      const programDuration = parseInt(data.phaseDuration);
      const startDate = new Date(data.startDate);

      // Pour chaque semaine du programme
      for (let week = 0; week < programDuration; week++) {
        // Alterner entre les types de semaine A et B
        const weekType = week % 2 === 0 ? 'A' : 'B';
        const weekTemplates = templatesByWeekType[weekType] || [];
        
        console.log(`Creating workouts for week ${week + 1}, type ${weekType}`);

        // Trier les templates par ordre de séquence
        weekTemplates.sort((a, b) => a.sequence_order - b.sequence_order);

        // Calculer la date de début de la semaine
        const weekStartDate = new Date(startDate);
        weekStartDate.setDate(startDate.getDate() + (week * 7));

        // Pour chaque jour d'entraînement de la semaine
        data.trainingDays.forEach((trainingDay, index) => {
          const template = weekTemplates[index];
          if (!template) return;

          // Calculer la date du prochain jour d'entraînement
          const workoutDate = getNextDayDate(weekStartDate, trainingDay);

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
