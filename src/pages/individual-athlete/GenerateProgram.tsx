
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Competition = {
  name: string;
  date: string;
  location: string;
};

type FormValues = {
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

  const selectedTrainingDays = form.watch("trainingDays");

  const onSubmit = async (data: FormValues) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("programs").insert([
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
      ]);

      if (error) throw error;

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
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de début</FormLabel>
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    className="rounded-md border"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="objective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objectif principal</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Améliorer mon temps sur 100m" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mainDistance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distance travaillée</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une distance" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DISTANCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trainingPhase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phase à travailler</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une phase" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PHASE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPhase && (
              <>
                <FormField
                  control={form.control}
                  name="phaseDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée de la phase</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une durée" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedPhase.durations.map((duration) => (
                            <SelectItem key={duration} value={duration}>
                              {duration} semaines
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trainingDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jours d'entraînement ({selectedTrainingDays.length} séances/semaine)</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="multiple"
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex flex-wrap gap-2"
                        >
                          {DAYS_OF_WEEK.map((day) => (
                            <ToggleGroupItem
                              key={day.value}
                              value={day.value}
                              aria-label={day.label}
                              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            >
                              {day.label}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Compétition principale</h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="mainCompetition.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la compétition</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mainCompetition.date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mainCompetition.location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieu</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
