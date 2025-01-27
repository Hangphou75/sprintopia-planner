import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AthleteCard } from "@/components/athletes/AthleteCard";
import { AthletePrograms } from "@/components/athletes/AthletePrograms";
import { Profile, Program } from "@/types/database";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const Athletes = () => {
  const { user } = useAuth();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<Profile | null>(null);
  const queryClient = useQueryClient();

  const { data: athletes } = useQuery({
    queryKey: ["coach-athletes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_athletes")
        .select(`
          *,
          athlete:profiles!coach_athletes_athlete_id_fkey (
            id,
            email,
            first_name,
            last_name,
            bio,
            avatar_url,
            role,
            created_at,
            updated_at
          )
        `)
        .eq("coach_id", user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: athletePrograms } = useQuery({
    queryKey: ["athlete-programs", selectedAthlete?.id],
    queryFn: async () => {
      if (!selectedAthlete?.id) return [];
      
      // Récupérer à la fois les programmes créés par l'athlète et les programmes partagés
      const { data: sharedPrograms, error: sharedError } = await supabase
        .from("shared_programs")
        .select(`
          program:programs (
            id,
            name,
            duration,
            objectives,
            start_date,
            created_at,
            updated_at,
            user_id
          )
        `)
        .eq("athlete_id", selectedAthlete.id);

      if (sharedError) throw sharedError;

      // Transformer les données pour n'avoir que les programmes
      const programs = sharedPrograms
        .map(sp => sp.program)
        .filter((program): program is Program => program !== null);

      return programs;
    },
    enabled: !!selectedAthlete?.id,
  });

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase
        .from("athlete_invitations")
        .insert([{ coach_id: user?.id, email }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-athletes"] });
      toast.success("Invitation envoyée avec succès");
      setIsInviteDialogOpen(false);
      setInviteEmail("");
    },
    onError: (error) => {
      console.error("Error sending invitation:", error);
      toast.error("Erreur lors de l'envoi de l'invitation");
    },
  });

  const deleteAthleteMutation = useMutation({
    mutationFn: async (athleteId: string) => {
      const { error } = await supabase
        .from("coach_athletes")
        .delete()
        .eq("athlete_id", athleteId)
        .eq("coach_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-athletes"] });
      toast.success("Athlète supprimé avec succès");
      setSelectedAthlete(null);
    },
    onError: (error) => {
      console.error("Error deleting athlete:", error);
      toast.error("Erreur lors de la suppression de l'athlète");
    },
  });

  const deleteProgramMutation = useMutation({
    mutationFn: async (programId: string) => {
      const { error } = await supabase
        .from("shared_programs")
        .delete()
        .eq("program_id", programId)
        .eq("coach_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["athlete-programs"] });
      toast.success("Programme supprimé avec succès");
    },
    onError: (error) => {
      console.error("Error deleting program:", error);
      toast.error("Erreur lors de la suppression du programme");
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate(inviteEmail);
  };

  const handleDeleteAthlete = (athlete: Profile) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${athlete.first_name} ${athlete.last_name} ?`)) {
      deleteAthleteMutation.mutate(athlete.id);
    }
  };

  const handleDeleteProgram = (programId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce programme ?")) {
      deleteProgramMutation.mutate(programId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mes athlètes</h1>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          Inviter un athlète
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {athletes?.map((relation) => (
          <AthleteCard
            key={relation.id}
            athlete={relation.athlete}
            onEdit={(athlete) => setSelectedAthlete(athlete)}
            onDelete={handleDeleteAthlete}
          />
        ))}
      </div>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inviter un athlète</DialogTitle>
            <DialogDescription>
              Envoyez une invitation à un athlète pour commencer à collaborer
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInvite}>
            <div className="grid gap-4 py-4">
              <Input
                type="email"
                placeholder="Email de l'athlète"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Envoyer l'invitation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Sheet open={!!selectedAthlete} onOpenChange={() => setSelectedAthlete(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {selectedAthlete?.first_name} {selectedAthlete?.last_name}
            </SheetTitle>
            <SheetDescription>
              Programmes de l'athlète
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {athletePrograms && (
              <AthletePrograms
                programs={athletePrograms}
                onDeleteProgram={handleDeleteProgram}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Athletes;