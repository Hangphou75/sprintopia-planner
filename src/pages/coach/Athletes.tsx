import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Share } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Athletes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  // Fetch athletes
  const { data: athletes } = useQuery({
    queryKey: ["athletes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_athletes")
        .select(`
          athlete_id,
          athlete:profiles!coach_athletes_athlete_id_fkey(
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
  });

  // Fetch programs for sharing
  const { data: programs } = useQuery({
    queryKey: ["programs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;
      return data;
    },
  });

  // Invite athlete mutation
  const inviteAthleteMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase
        .from("athlete_invitations")
        .insert([{ coach_id: user?.id, email }]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation envoyée avec succès");
      setShowInviteDialog(false);
      setInviteEmail("");
    },
    onError: (error) => {
      console.error("Error inviting athlete:", error);
      toast.error("Erreur lors de l'envoi de l'invitation");
    },
  });

  // Share program mutation
  const shareProgramMutation = useMutation({
    mutationFn: async ({ programId, athleteId }: { programId: string; athleteId: string }) => {
      const { error } = await supabase
        .from("shared_programs")
        .insert([{
          program_id: programId,
          athlete_id: athleteId,
          coach_id: user?.id
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Programme partagé avec succès");
      setShowShareDialog(false);
      setSelectedAthleteId(null);
    },
    onError: (error) => {
      console.error("Error sharing program:", error);
      toast.error("Erreur lors du partage du programme");
    },
  });

  // Remove athlete mutation
  const removeAthleteMutation = useMutation({
    mutationFn: async (athleteId: string) => {
      const { error } = await supabase
        .from("coach_athletes")
        .delete()
        .eq("coach_id", user?.id)
        .eq("athlete_id", athleteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["athletes"] });
      toast.success("Athlète retiré avec succès");
    },
    onError: (error) => {
      console.error("Error removing athlete:", error);
      toast.error("Erreur lors de la suppression de l'athlète");
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    inviteAthleteMutation.mutate(inviteEmail);
  };

  const handleShareProgram = (programId: string) => {
    if (!selectedAthleteId) return;
    shareProgramMutation.mutate({ programId, athleteId: selectedAthleteId });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes Athlètes</h1>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Inviter un athlète
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inviter un athlète</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <Input
                type="email"
                placeholder="Email de l'athlète"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Envoyer l'invitation
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {athletes?.map((relation) => (
              <TableRow key={relation.athlete.id}>
                <TableCell>
                  {relation.athlete.first_name} {relation.athlete.last_name}
                </TableCell>
                <TableCell>{relation.athlete.email}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAthleteId(relation.athlete.id);
                        setShowShareDialog(true);
                      }}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Partager un programme
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeAthleteMutation.mutate(relation.athlete.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!athletes || athletes.length === 0) && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Aucun athlète pour le moment
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partager un programme</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {programs?.map((program) => (
              <Button
                key={program.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleShareProgram(program.id)}
              >
                {program.name}
              </Button>
            ))}
            {(!programs || programs.length === 0) && (
              <p className="text-center text-muted-foreground">
                Aucun programme disponible
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Athletes;