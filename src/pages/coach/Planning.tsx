import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
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
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";

type ProgramFormValues = {
  name: string;
  duration: number;
  objectives: string;
  startDate: Date;
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
    },
  });

  const { data: programs, refetch } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      console.log("Fetching programs for user:", user?.id);
      const { data, error } = await supabase
        .from("programs")
        .select("*")
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

      const { data, error } = await supabase
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

      if (error) {
        console.error("Error creating program:", error);
        toast.error("Erreur lors de la création du programme");
        return;
      }

      console.log("Program created successfully:", data);
      toast.success("Programme créé avec succès");
      setOpen(false);
      form.reset();
      refetch();
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error("Erreur lors de la création du programme");
    }
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