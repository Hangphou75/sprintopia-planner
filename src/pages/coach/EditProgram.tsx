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
        .select("*")
        .eq("id", programId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (values: ProgramFormValues) => {
    try {
      const { error } = await supabase
        .from("programs")
        .update({
          name: values.name,
          duration: values.duration,
          objectives: values.objectives,
          start_date: values.startDate.toISOString(),
        })
        .eq("id", programId);

      if (error) throw error;

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

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Modifier le programme</h1>
      <ProgramForm
        onSubmit={handleSubmit}
        initialValues={{
          name: program.name,
          duration: program.duration,
          objectives: program.objectives || "",
          startDate: new Date(program.start_date),
        }}
      />
    </div>
  );
};