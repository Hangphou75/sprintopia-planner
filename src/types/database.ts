
import { Database } from "@/integrations/supabase/types";

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Types spécifiques
export type Profile = Tables<'profiles'>;
export type Program = Tables<'programs'>;
export type Workout = Tables<'workouts'>;
export type Competition = Tables<'competitions'>;
export type AthleteInvitation = Tables<'athlete_invitations'>;
export type CoachAthlete = Tables<'coach_athletes'>;
export type SharedProgram = Tables<'shared_programs'>;
export type WorkoutFeedback = Tables<'workout_feedback'>;
export type ActiveProgram = Tables<'active_programs'>;
export type ProgramPhaseDescription = Tables<'program_phase_descriptions'>;

// Types pour les insertions
export type InsertProfile = InsertTables<'profiles'>;
export type InsertProgram = InsertTables<'programs'>;
export type InsertWorkout = InsertTables<'workouts'>;
export type InsertCompetition = InsertTables<'competitions'>;
export type InsertAthleteInvitation = InsertTables<'athlete_invitations'>;
export type InsertCoachAthlete = InsertTables<'coach_athletes'>;
export type InsertSharedProgram = InsertTables<'shared_programs'>;
export type InsertWorkoutFeedback = InsertTables<'workout_feedback'>;
export type InsertActiveProgram = InsertTables<'active_programs'>;
export type InsertProgramPhaseDescription = InsertTables<'program_phase_descriptions'>;

// Types pour les mises à jour
export type UpdateProfile = UpdateTables<'profiles'>;
export type UpdateProgram = UpdateTables<'programs'>;
export type UpdateWorkout = UpdateTables<'workouts'>;
export type UpdateCompetition = UpdateTables<'competitions'>;
export type UpdateAthleteInvitation = UpdateTables<'athlete_invitations'>;
export type UpdateCoachAthlete = UpdateTables<'coach_athletes'>;
export type UpdateSharedProgram = UpdateTables<'shared_programs'>;
export type UpdateWorkoutFeedback = UpdateTables<'workout_feedback'>;
export type UpdateActiveProgram = UpdateTables<'active_programs'>;
export type UpdateProgramPhaseDescription = UpdateTables<'program_phase_descriptions'>;

// Enums
export type SprintDistance = Enums<'sprint_distance'>;
export type CompetitionLevel = Enums<'competition_level'>;
export type TrainingPhase = Enums<'training_phase'>;
export type WorkoutTheme = Enums<'workout_theme'>;
export type WorkoutType = Enums<'workout_type'>;
export type TrainingPhaseDescription = Enums<'training_phase_description'>;
