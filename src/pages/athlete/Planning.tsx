import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { useToast } from "@/hooks/use-toast";

interface NewProgramForm {
  name: string;
  duration: number;
  objectives?: string;
  start_date: string;
}

const AthletePlanning = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const form = useForm<NewProgramForm>({
    defaultValues: {
      name: "",
      duration: 12,
      objectives: "",
      start_date: new Date().toISOString().split('T')[0]
    }
  });

  const onSubmit = async (data: NewProgramForm) => {
    try {
      if (!user?.id) {
        throw new Error("Utilisateur non authentifié");
      }

      // Validate user ID format
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(user.id)) {
        throw new Error("Format d'identifiant utilisateur invalide");
      }

      const programData = {
        name: data.name,
        duration: Number(data.duration),
        objectives: data.objectives || null,
        start_date: new Date(data.start_date).toISOString(),
        user_id: user.id
      };

      console.log("Creating program with data:", programData);

      const { error } = await supabase
        .from('programs')
        .insert(programData);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast({
        title: "Succès",
        description: "Programme créé avec succès",
      });
      
      setOpen(false);
      form.reset();
    } catch (error: any) {
      console.error('Error creating program:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le programme",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Programmes d'entraînement</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Programme
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau programme</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer votre programme d'entraînement
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du programme</FormLabel>
                      <FormControl>
                        <Input placeholder="Entrez le nom du programme" {...field} />
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
                          min="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de début</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                      <FormLabel>Objectifs (optionnel)</FormLabel>
                      <FormControl>
                        <Input placeholder="Entrez les objectifs du programme" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Créer le programme</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-gray-500">Aucun programme d'entraînement disponible</p>
    </div>
  );
};

export default AthletePlanning;