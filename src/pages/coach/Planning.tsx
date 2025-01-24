import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

type Competition = {
  name: string;
  date: Date;
  distance: "60" | "100" | "200" | "400";
  level: "local" | "regional" | "national" | "international";
  is_main: boolean;
  location?: string;
};

type ProgramFormValues = {
  name: string;
  duration: number;
  objectives: string;
  startDate: Date;
  mainCompetition: Competition;
  otherCompetitions: Competition[];
};

const CoachPlanning = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
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

  const { data: programs, refetch } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      console.log("Fetching programs for user:", user?.id);
      const { data, error } = await supabase
        .from("programs")
        .select("*, competitions(*)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching programs:", error);
        throw error;
      }

      console.log("Programs fetched:", data);
      return data;
    },
  });

  const onSubmit = async (values: ProgramFormValues) => {
    try {
      console.log("Creating program with values:", values);
      console.log("User ID:", user?.id);

      if (!user?.id) {
        toast.error("Erreur: Utilisateur non connecté");
        return;
      }

      // Créer le programme
      const { data: program, error: programError } = await supabase
        .from("programs")
        .insert({
          name: values.name,
          duration: values.duration,
          objectives: values.objectives,
          start_date: values.startDate.toISOString(),
          user_id: user.id,
        })
        .select()
        .single();

      if (programError) {
        console.error("Error creating program:", programError);
        toast.error("Erreur lors de la création du programme");
        return;
      }

      // Créer la compétition principale
      const { error: mainCompError } = await supabase
        .from("competitions")
        .insert({
          program_id: program.id,
          name: values.mainCompetition.name,
          date: values.mainCompetition.date.toISOString(),
          distance: values.mainCompetition.distance,
          level: values.mainCompetition.level,
          is_main: true,
          location: values.mainCompetition.location,
        });

      if (mainCompError) {
        console.error("Error creating main competition:", mainCompError);
        toast.error("Erreur lors de la création de la compétition principale");
        return;
      }

      // Créer les compétitions intermédiaires
      if (values.otherCompetitions.length > 0) {
        const { error: otherCompError } = await supabase
          .from("competitions")
          .insert(
            values.otherCompetitions.map((comp) => ({
              program_id: program.id,
              name: comp.name,
              date: comp.date.toISOString(),
              distance: comp.distance,
              level: comp.level,
              is_main: false,
              location: comp.location,
            }))
          );

        if (otherCompError) {
          console.error("Error creating other competitions:", otherCompError);
          toast.error("Erreur lors de la création des compétitions intermédiaires");
          return;
        }
      }

      console.log("Program created successfully:", program);
      toast.success("Programme créé avec succès");
      setOpen(false);
      form.reset();
      refetch();
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error("Erreur lors de la création du programme");
    }
  };

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
    <div className="container mx-auto p-6 max-w-4xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestion des programmes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Programme
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Créer un nouveau programme</DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous pour créer un nouveau programme d'entraînement.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[calc(100vh-12rem)] px-1">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                  {/* Compétition principale */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Trophy className="mr-2 h-4 w-4" />
                      Compétition principale
                    </h3>
                    <FormField
                      control={form.control}
                      name="mainCompetition.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de la compétition</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Championnats de France" {...field} />
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
                          <FormLabel>Date de la compétition</FormLabel>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            className="rounded-md border"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="mainCompetition.distance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Distance</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
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
                        name="mainCompetition.level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Niveau</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez un niveau" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="local">Local</SelectItem>
                                <SelectItem value="regional">Régional</SelectItem>
                                <SelectItem value="national">National</SelectItem>
                                <SelectItem value="international">International</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="mainCompetition.location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lieu</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Stade Charléty" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Compétitions intermédiaires */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Compétitions intermédiaires</h3>
                      <Button type="button" variant="outline" onClick={addCompetition}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter
                      </Button>
                    </div>
                    {form.watch("otherCompetitions").map((_, index) => (
                      <div key={index} className="space-y-4 border-l-2 pl-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Compétition {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCompetition(index)}
                          >
                            Supprimer
                          </Button>
                        </div>
                        <FormField
                          control={form.control}
                          name={`otherCompetitions.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom</FormLabel>
                              <FormControl>
                                <Input placeholder="Nom de la compétition" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`otherCompetitions.${index}.distance`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Distance</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Distance" />
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
                            name={`otherCompetitions.${index}.level`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Niveau</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Niveau" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="local">Local</SelectItem>
                                    <SelectItem value="regional">Régional</SelectItem>
                                    <SelectItem value="national">National</SelectItem>
                                    <SelectItem value="international">International</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`otherCompetitions.${index}.date`}
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
                                className="rounded-md border"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`otherCompetitions.${index}.location`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lieu</FormLabel>
                              <FormControl>
                                <Input placeholder="Lieu de la compétition" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>

                  <Button type="submit" className="w-full">
                    Créer le programme
                  </Button>
                </form>
              </Form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
      <ScrollArea className="flex-1">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programs?.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-8">
              Aucun programme créé
            </p>
          ) : (
            programs?.map((program) => (
              <div
                key={program.id}
                className="p-6 border rounded-lg hover:border-primary transition-colors bg-card"
              >
                <h3 className="font-semibold text-lg mb-2">{program.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {program.duration} semaines - Début le{" "}
                  {new Date(program.start_date).toLocaleDateString()}
                </p>
                {program.objectives && (
                  <p className="text-sm text-card-foreground">{program.objectives}</p>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CoachPlanning;