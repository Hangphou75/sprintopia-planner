import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProgramForm, ProgramFormValues } from "@/components/programs/ProgramForm";
import { useAuth } from "@/contexts/AuthContext";

const CreateProgram = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (values: ProgramFormValues) => {
    try {
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

      toast.success("Programme créé avec succès");
      navigate("/coach/planning");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Erreur lors de la création du programme");
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Créer un nouveau programme</h1>
        <p className="text-muted-foreground mt-2">
          Remplissez les informations ci-dessous pour créer un nouveau programme d'entraînement.
        </p>
      </div>
      <ProgramForm onSubmit={handleSubmit} mode="create" />
    </div>
  );
};

export default CreateProgram;