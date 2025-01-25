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

type AthleteRelation = {
  id: string;
  athlete: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
};

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
          id,
          athlete:profiles!coach_athletes_athlete_id_fkey(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq("coach_id", user?.id);

      if (error) throw error;
      return data as AthleteRelation[];
    },
  });

  // Fetch invitations
  const { data: invitations } = useQuery({
    queryKey: ["invitations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("athlete_invitations")
        .select("*")
        .eq("coach_id", user?.id);

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

      // Appel à la fonction Edge pour envoyer l'email d'invitation
      const response = await fetch("/api/send-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          coachName: `${user?.first_name} ${user?.last_name}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi de l'email d'invitation");
      }
    },
    onSuccess: () => {
      toast.success("Invitation envoyée avec succès");
      setShowInviteDialog(false);
      setInviteEmail("");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (error) => {
      console.error("Error inviting athlete:", error);
      toast.error("Erreur lors de l'envoi de l'invitation");
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

      <div className="space-y-6">
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
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeAthleteMutation.mutate(relation.athlete.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Invitations en attente</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'envoi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations?.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell>
                    <span className="capitalize">{invitation.status}</span>
                  </TableCell>
                  <TableCell>
                    {new Date(invitation.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {(!invitations || invitations.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Aucune invitation en attente
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Athletes;