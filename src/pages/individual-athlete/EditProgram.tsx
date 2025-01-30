import { useParams, useNavigate } from "react-router-dom";
import { ProgramForm, ProgramFormValues } from "@/components/programs/ProgramForm";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const EditProgram = () => {
  const { programId } = useParams();
  const navigate = useNavigate();

  const { data: program, isLoading } = useQuery({
    queryKey: ["program", programId],
    queryFn: async () => {
      console.log("Fetching program data for ID:", programId);
      const { data, error } = await supabase
        .from("programs")
        .select("*, competitions(*)")
        .eq("id", programId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching program:", error);
        throw error;
      }
      
      console.log("Program data retrieved:", data);
      return data;
    },
  });

  const handleSubmit = async (values: ProgramFormValues) => {
    try {
      console.log("Starting program update with values:", values);
      
      // Update program
      const { error: programError } = await supabase
        .from("programs")
        .update({
          name: values.name,
          duration: values.duration,
          objectives: values.objectives,
          start_date: values.startDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", programId);

      if (programError) {
        console.error("Error updating program:", programError);
        toast.error("Erreur lors de la mise à jour du programme");
        return;
      }

      console.log("Program updated successfully");

      // Update main competition
      if (values.mainCompetition) {
        console.log("Updating main competition:", values.mainCompetition);
        const { error: mainCompError } = await supabase
          .from("competitions")
          .update({
            name: values.mainCompetition.name,
            date: values.mainCompetition.date.toISOString(),
            distance: values.mainCompetition.distance,
            level: values.mainCompetition.level,
            location: values.mainCompetition.location,
          })
          .eq("program_id", programId)
          .eq("is_main", true);

        if (mainCompError) {
          console.error("Error updating main competition:", mainCompError);
          toast.error("Erreur lors de la mise à jour de la compétition principale");
          return;
        }
        console.log("Main competition updated successfully");
      }

      // Update other competitions
      if (values.otherCompetitions && values.otherCompetitions.length > 0) {
        console.log("Updating other competitions:", values.otherCompetitions);
        
        // Get existing other competitions
        const { data: existingCompetitions, error: fetchError } = await supabase
          .from("competitions")
          .select("id")
          .eq("program_id", programId)
          .eq("is_main", false);

        if (fetchError) {
          console.error("Error fetching existing competitions:", fetchError);
          toast.error("Erreur lors de la récupération des compétitions");
          return;
        }

        const existingIds = existingCompetitions?.map(comp => comp.id) || [];
        const updatePromises = values.otherCompetitions.map(async (comp, index) => {
          if (existingIds[index]) {
            // Update existing competition
            return supabase
              .from("competitions")
              .update({
                name: comp.name,
                date: comp.date.toISOString(),
                distance: comp.distance,
                level: comp.level,
                location: comp.location,
              })
              .eq("id", existingIds[index]);
          } else {
            // Create new competition
            return supabase
              .from("competitions")
              .insert({
                program_id: programId,
                name: comp.name,
                date: comp.date.toISOString(),
                distance: comp.distance,
                level: comp.level,
                is_main: false,
                location: comp.location,
              });
          }
        });

        // If we have fewer new competitions than existing ones, delete the excess
        if (existingIds.length > values.otherCompetitions.length) {
          const idsToDelete = existingIds.slice(values.otherCompetitions.length);
          const { error: deleteError } = await supabase
            .from("competitions")
            .delete()
            .in("id", idsToDelete);

          if (deleteError) {
            console.error("Error deleting excess competitions:", deleteError);
            toast.error("Erreur lors de la suppression des compétitions");
            return;
          }
        }

        // Execute all updates
        const results = await Promise.all(updatePromises);
        const errors = results.filter(result => result.error);
        
        if (errors.length > 0) {
          console.error("Errors updating competitions:", errors);
          toast.error("Erreur lors de la mise à jour des compétitions intermédiaires");
          return;
        }
        console.log("Other competitions updated successfully");
      }

      toast.success("Programme mis à jour avec succès");
      navigate(`/individual-athlete/programs/${programId}/workouts`);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Erreur lors de la mise à jour du programme");
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!program) {
    return <div>Programme non trouvé</div>;
  }

  const initialValues: Partial<ProgramFormValues> = {
    name: program.name,
    duration: program.duration,
    objectives: program.objectives || "",
    startDate: new Date(program.start_date),
    mainCompetition: program.competitions?.find((c: any) => c.is_main)
      ? {
          name: program.competitions.find((c: any) => c.is_main).name,
          date: new Date(program.competitions.find((c: any) => c.is_main).date),
          distance: program.competitions.find((c: any) => c.is_main).distance,
          level: program.competitions.find((c: any) => c.is_main).level,
          is_main: true,
          location: program.competitions.find((c: any) => c.is_main).location || "",
        }
      : undefined,
    otherCompetitions: program.competitions
      ?.filter((c: any) => !c.is_main)
      .map((comp: any) => ({
        name: comp.name,
        date: new Date(comp.date),
        distance: comp.distance,
        level: comp.level,
        is_main: false,
        location: comp.location || "",
      })) || [],
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Button 
        variant="outline" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>
      <h1 className="text-2xl font-bold mb-6">Modifier le programme</h1>
      <ProgramForm onSubmit={handleSubmit} initialValues={initialValues} mode="edit" />
    </div>
  );
};