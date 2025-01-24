import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import { CompetitionForm } from "./CompetitionForm";
import { ScrollArea } from "@/components/ui/scroll-area";

type Competition = {
  name: string;
  date: Date;
  distance: "60" | "100" | "200" | "400";
  level: "local" | "regional" | "national" | "international";
  is_main: boolean;
  location?: string;
};

export type ProgramFormValues = {
  name: string;
  duration: number;
  objectives: string;
  startDate: Date;
  mainCompetition: Competition;
  otherCompetitions: Competition[];
};

type ProgramFormProps = {
  onSubmit: (values: ProgramFormValues) => Promise<void>;
};

export const ProgramForm = ({ onSubmit }: ProgramFormProps) => {
  const form = useForm<ProgramFormValues>({
    defaultValues: {
      name: "",
      duration: 12,
      objectives: "",
      startDate: new Date(),
      mainCompetition: {
        name: "",
        date: new Date(),
        distance: "100",
        level: "regional",
        is_main: true,
      },
      otherCompetitions: [],
    },
  });

  const addCompetition = () => {
    const currentCompetitions = form.getValues("otherCompetitions");
    form.setValue("otherCompetitions", [
      ...currentCompetitions,
      {
        name: "",
        date: new Date(),
        distance: "100",
        level: "regional",
        is_main: false,
      },
    ]);
  };

  const removeCompetition = (index: number) => {
    const currentCompetitions = form.getValues("otherCompetitions");
    form.setValue(
      "otherCompetitions",
      currentCompetitions.filter((_, i) => i !== index)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ScrollArea className="h-[calc(100vh-12rem)] px-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du programme</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Préparation 100m" {...field} />
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
                <FormLabel>Durée (semaines)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Ex: 12"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="objectives"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objectifs</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez les objectifs du programme"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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

          <CompetitionForm
            control={form.control}
            isMain={true}
            namePrefix="mainCompetition"
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Compétitions intermédiaires</h3>
              <Button type="button" variant="outline" onClick={addCompetition}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>
            {form.watch("otherCompetitions").map((_, index) => (
              <CompetitionForm
                key={index}
                control={form.control}
                isMain={false}
                namePrefix={`otherCompetitions.${index}`}
                onRemove={() => removeCompetition(index)}
              />
            ))}
          </div>

          <Button type="submit" className="w-full mt-6">
            Créer le programme
          </Button>
        </ScrollArea>
      </form>
    </Form>
  );
};