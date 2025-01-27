import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

const Programs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  const { data: programs, isLoading } = useQuery({
    queryKey: ["programs", user?.id],
    queryFn: async () => {
      console.log("Fetching programs for user:", user?.id);
      const { data, error } = await supabase
        .from("programs")
        .select(`
          *,
          competitions(*),
          shared_programs(
            athlete:profiles!shared_programs_athlete_id_fkey(
              id,
              first_name,
              last_name,
              email
            )
          ),
          coach:profiles!programs_user_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Programs fetched:", data);
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: athletes } = useQuery({
    queryKey: ["coach-athletes", user?.id],
    queryFn: async () => {
      console.log("Fetching athletes for coach:", user?.id);
      const { data, error } = await supabase
        .from("coach_athletes")
        .select(`
          athlete:profiles!coach_athletes_athlete_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq("coach_id", user?.id);

      if (error) throw error;
      console.log("Athletes fetched:", data);
      return data;
    },
    enabled: !!user?.id,
  });

  const handleShare = async (athleteId: string) => {
    if (!user?.id || !selectedProgramId) return;
    console.log("Sharing program:", selectedProgramId, "with athlete:", athleteId);

    try {
      const { error } = await supabase
        .from("shared_programs")
        .insert({
          program_id: selectedProgramId,
          athlete_id: athleteId,
          coach_id: user.id,
        });

      if (error) {
        console.error("Error sharing program:", error);
        throw error;
      }

      toast.success("Programme partagé avec succès");
      setIsShareDialogOpen(false);
      setSelectedProgramId(null);
    } catch (error) {
      console.error("Error sharing program:", error);
      toast.error("Erreur lors du partage du programme");
    }
  };

  const onShareProgram = (programId: string) => {
    console.log("Opening share dialog for program:", programId);
    setSelectedProgramId(programId);
    setIsShareDialogOpen(true);
  };

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
              <ProgramCard 
                key={program.id} 
                program={program}
                onShare={onShareProgram}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Associer le programme</DialogTitle>
            <DialogDescription>
              Choisissez un athlète à qui associer ce programme
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {athletes?.map((relation) => (
              <Button
                key={relation.athlete.id}
                variant="outline"
                className="justify-start"
                onClick={() => handleShare(relation.athlete.id)}
              >
                {relation.athlete.first_name} {relation.athlete.last_name}
              </Button>
            ))}
            {(!athletes || athletes.length === 0) && (
              <p className="text-muted-foreground text-center">
                Aucun athlète disponible
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Programs;