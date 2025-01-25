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
      const { data, error } = await supabase
        .from("programs")
        .select("*, competitions(*)")
        .eq("id", programId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (values: ProgramFormValues) => {
    try {
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

      // Update main competition
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

      // Delete existing other competitions
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

      // Insert new other competitions if any exist
      if (values.otherCompetitions && values.otherCompetitions.length > 0) {
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
      }

      toast.success("Programme mis à jour avec succès");
      navigate(`/coach/programs/${programId}/workouts`);
    } catch (error) {
      console.error("Error updating program:", error);
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