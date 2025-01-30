import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Program } from "@/types/program";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CoachPlanning = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: programs, isLoading } = useQuery({
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

  const deleteMutation = useMutation({
    mutationFn: async (programId: string) => {
      const { error } = await supabase
        .from("programs")
        .delete()
        .eq("id", programId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Programme supprimé avec succès");
    },
    onError: (error) => {
      console.error("Error deleting program:", error);
      toast.error("Erreur lors de la suppression du programme");
    },
  });

  const handleDeleteProgram = (programId: string) => {
    deleteMutation.mutate(programId);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Planning</h1>
        <Button 
          onClick={() => navigate("/coach/programs/new")}
          size="lg"
          className="w-full sm:w-auto bg-[#0F172A] text-white hover:bg-[#1E293B]"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nouveau Programme
        </Button>
      </div>
      <ScrollArea className="flex-1 px-1">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {!programs || programs.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-8">
              Aucun programme créé
            </p>
          ) : (
            programs.map((program) => (
              <ProgramCard 
                key={program.id} 
                program={program} 
                onDelete={handleDeleteProgram}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CoachPlanning;