
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Timer,
  Zap,
  Flame,
  Dumbbell,
  Sparkles,
  Activity,
  ArrowUp,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

export type WorkoutFormValues = {
  title: string;
  description: string;
  date: Date;
  time: string;
  theme: string;
  recovery: string;
  details: string;
  phase?: "preparation" | "specific" | "competition";
  type?: "resistance" | "speed" | "endurance" | "mobility" | "technical";
  intensity?: string;
};

type WorkoutFormProps = {
  onSubmit: (values: WorkoutFormValues) => Promise<void>;
  initialValues?: Partial<WorkoutFormValues>;
};

const themes = [
  { name: "Aérobie", value: "aerobic", icon: Timer, color: "theme-aerobic" },
  { name: "Anaérobie Alactique", value: "anaerobic-alactic", icon: Zap, color: "theme-anaerobic-alactic" },
  { name: "Anaérobie lactique", value: "anaerobic-lactic", icon: Flame, color: "theme-anaerobic-lactic" },
  { name: "Renforcement musculaire", value: "strength", icon: Dumbbell, color: "theme-strength" },
  { name: "Travail technique", value: "technical", icon: Sparkles, color: "theme-technical" },
  { name: "Mobilité", value: "mobility", icon: Activity, color: "theme-mobility" },
  { name: "Plyométrie", value: "plyometric", icon: ArrowUp, color: "theme-plyometric" },
];

export const WorkoutForm = ({ onSubmit, initialValues }: WorkoutFormProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedTheme, setSelectedTheme] = useState(initialValues?.theme || themes[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<WorkoutFormValues>({
    defaultValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      date: initialValues?.date || new Date(),
      time: initialValues?.time || "09:00",
      theme: initialValues?.theme || themes[0].value,
      recovery: initialValues?.recovery || "",
      details: initialValues?.details || "",
      phase: initialValues?.phase || undefined,
      type: initialValues?.type || undefined,
      intensity: initialValues?.intensity || undefined,
    },
  });

  const currentTheme = themes.find(t => t.value === selectedTheme);
  const ThemeIcon = currentTheme?.icon || Timer;
  const isEditMode = !!initialValues?.title;

  const handleSubmit = async (values: WorkoutFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      toast.success(isEditMode ? "Séance modifiée avec succès" : "Séance créée avec succès");
    } catch (error) {
      console.error("Error creating workout:", error);
      toast.error(isEditMode ? "Erreur lors de la modification de la séance" : "Erreur lors de la création de la séance");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className={cn(
          "space-y-4 p-6 rounded-lg border transition-colors",
          isMobile ? "grid grid-cols-1" : "grid grid-cols-2 gap-6",
          currentTheme && `border-${currentTheme.color}`
        )}
      >
        <div className={isMobile ? "col-span-1" : "col-span-2"} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>

        <div className={isMobile ? "col-span-1 space-y-4" : "space-y-4"}>
          {/* Titre de la séance */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre de la séance</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Séance de vitesse" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description de la séance"
                    className="h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Thème */}
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thème</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedTheme(value);
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un thème" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {themes.map((theme) => {
                      const Icon = theme.icon;
                      return (
                        <SelectItem 
                          key={theme.value} 
                          value={theme.value}
                          className={cn(
                            "flex items-center gap-2",
                            `text-${theme.color}`
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {theme.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => date && field.onChange(date)}
                  disabled={(date) =>
                    date < new Date("1900-01-01")
                  }
                  initialFocus
                  className="rounded-md border"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Heure */}
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Récupération */}
          <FormField
            control={form.control}
            name="recovery"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Récupération</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 2min entre les séries" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* En version non-mobile, c'est ici que se trouvent les champs de droite */}
        {!isMobile && (
          <div className="space-y-4">
            {/* Ces champs seront déplacés dans la colonne principale en version mobile */}
          </div>
        )}

        {/* Détails de la séance */}
        <div className={isMobile ? "col-span-1" : "col-span-2"}>
          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Détails de la séance</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Détaillez le contenu de la séance"
                    className="h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Boutons de validation */}
        <div className={isMobile ? "col-span-1" : "col-span-2"} style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="min-w-32"
          >
            <ThemeIcon className="mr-2 h-4 w-4" />
            {isSubmitting 
              ? (isEditMode ? "Modification..." : "Création...") 
              : (isEditMode ? "Modifier la séance" : "Créer la séance")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
