
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

type FormValues = {
  objective: string;
  competitionDistance: string;
  level: string;
  trainingDaysPerWeek: number;
  duration: number;
};

const GenerateProgram = () => {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    defaultValues: {
      objective: "",
      competitionDistance: "100",
      level: "intermediate",
      trainingDaysPerWeek: 4,
      duration: 12,
    },
  });

  const onSubmit = async (data: FormValues) => {
    console.log("Form data:", data);
    // La logique de génération sera implémentée plus tard
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
              name="competitionDistance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distance de compétition</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une distance" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="60">60m</SelectItem>
                      <SelectItem value="100">100m</SelectItem>
                      <SelectItem value="200">200m</SelectItem>
                      <SelectItem value="400">400m</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre niveau" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Débutant</SelectItem>
                      <SelectItem value="intermediate">Intermédiaire</SelectItem>
                      <SelectItem value="advanced">Avancé</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trainingDaysPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jours d'entraînement par semaine</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={2} 
                      max={6} 
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durée du programme (semaines)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={4} 
                      max={24} 
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
