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

export type WorkoutFormValues = {
  title: string;
  description: string;
  date: Date;
  time: string;
  theme: string;
  recovery: string;
  details: string;
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
    },
  });

  const currentTheme = themes.find(t => t.value === selectedTheme);
  const ThemeIcon = currentTheme?.icon || Timer;

  const handleSubmit = async (values: WorkoutFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      toast.success("Séance créée avec succès");
    } catch (error) {
      console.error("Error creating workout:", error);
      toast.error("Erreur lors de la création de la séance");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className={cn(
          "space-y-4 p-6 rounded-lg border transition-colors grid grid-cols-2 gap-6",
          currentTheme && `border-${currentTheme.color}`
        )}
      >
        <div className="col-span-2 flex justify-between items-center">
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

        <div className="space-y-4">
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
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
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

        <div className="col-span-2">
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

        <div className="col-span-2 flex justify-end gap-4">
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
            {isSubmitting ? "Création..." : "Créer la séance"}
          </Button>
        </div>
      </form>
    </Form>
  );
};