
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ShareProgramDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string | null;
}

export const ShareProgramDialog = ({
  isOpen,
  onOpenChange,
  programId,
}: ShareProgramDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: athletes } = useQuery({
    queryKey: ["coach-athletes", user?.id],
    queryFn: async () => {
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
      return data;
    },
    enabled: !!user?.id,
  });

  const handleShare = async (athleteId: string) => {
    if (!user?.id || !programId) return;

    try {
      const { error } = await supabase
        .from("shared_programs")
        .insert({
          program_id: programId,
          athlete_id: athleteId,
          coach_id: user.id,
        });

      if (error) throw error;

      toast.success("Programme partagé avec succès");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    } catch (error) {
      console.error("Error sharing program:", error);
      toast.error("Erreur lors du partage du programme");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
  );
};
