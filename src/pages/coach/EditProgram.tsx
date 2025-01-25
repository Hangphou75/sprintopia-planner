import { useParams, useNavigate } from "react-router-dom";
import { ProgramForm, ProgramFormValues } from "@/components/programs/ProgramForm";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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
          .upsert({
            program_id: programId,
            name: values.mainCompetition.name,
            date: values.mainCompetition.date.toISOString(),
            distance: values.mainCompetition.distance,
            level: values.mainCompetition.level,
            is_main: true,
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

      // Delete existing other competitions
      console.log("Deleting existing other competitions");
      const { error: deleteError } = await supabase
        .from("competitions")
        .delete()
        .eq("program_id", programId)
        .eq("is_main", false);

      if (deleteError) {
        console.error("Error deleting old competitions:", deleteError);
        toast.error("Erreur lors de la mise à jour des compétitions intermédiaires");
        return;
      }
      console.log("Old competitions deleted successfully");

      // Insert new other competitions if any exist
      if (values.otherCompetitions && values.otherCompetitions.length > 0) {
        console.log("Inserting new other competitions:", values.otherCompetitions);
        const { error: otherCompError } = await supabase
          .from("competitions")
          .insert(
            values.otherCompetitions.map((comp) => ({
              program_id: programId,
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
        console.log("Other competitions inserted successfully");
      }

      toast.success("Programme mis à jour avec succès");
      navigate(`/coach/programs/${programId}/workouts`);
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
      <h1 className="text-2xl font-bold mb-6">Modifier le programme</h1>
      <ProgramForm onSubmit={handleSubmit} initialValues={initialValues} mode="edit" />
    </div>
  );
};