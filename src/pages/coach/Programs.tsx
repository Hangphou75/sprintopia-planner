import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const Programs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: programs, isLoading } = useQuery({
    queryKey: ["programs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select(`
          *,
          competitions(*),
          coach:profiles!programs_user_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching programs:", error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement des programmes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes programmes</h1>
        <Button onClick={() => navigate("/coach/programs/new")}>
          Nouveau programme
        </Button>
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

export default Programs;