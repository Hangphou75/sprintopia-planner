import { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ProgramForm, ProgramFormValues } from "@/components/programs/ProgramForm";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Program } from "@/types/program";

const CoachPlanning = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

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
      return data as Program[];
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
      refetch();
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error("Erreur lors de la création du programme");
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestion des programmes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0F172A] text-white hover:bg-[#1E293B]">
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
            <ProgramForm onSubmit={onSubmit} />
          </DialogContent>
        </Dialog>
      </div>
      <ScrollArea className="flex-1 px-1">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {!programs || programs.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-8">
              Aucun programme créé
            </p>
          ) : (
            programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CoachPlanning;