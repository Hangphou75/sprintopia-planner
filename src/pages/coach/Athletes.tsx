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
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Athletes = () => {
  const { user } = useAuth();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
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
            last_name
          )
        `)
        .eq("coach_id", user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: invitations } = useQuery({
    queryKey: ["coach-invitations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("athlete_invitations")
        .select()
        .eq("coach_id", user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase
        .from("athlete_invitations")
        .insert([
          {
            coach_id: user?.id,
            email,
          },
        ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-invitations"] });
      toast.success("Invitation envoyée avec succès");
      setIsInviteDialogOpen(false);
      setInviteEmail("");
    },
    onError: (error) => {
      console.error("Error sending invitation:", error);
      toast.error("Erreur lors de l'envoi de l'invitation");
    },
  });

  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("athlete_invitations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-invitations"] });
      toast.success("Invitation renvoyée avec succès");
    },
    onError: (error) => {
      console.error("Error resending invitation:", error);
      toast.error("Erreur lors du renvoi de l'invitation");
    },
  });

  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("athlete_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-invitations"] });
      toast.success("Invitation supprimée avec succès");
    },
    onError: (error) => {
      console.error("Error deleting invitation:", error);
      toast.error("Erreur lors de la suppression de l'invitation");
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate(inviteEmail);
  };

  const getFullName = (athlete: { first_name: string | null; last_name: string | null }) => {
    return `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim() || 'Athlète';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mes athlètes</h1>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          Inviter un athlète
        </Button>
      </div>

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Athlètes actifs</h2>
        {athletes?.map((relation) => (
          <div
            key={relation.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <p className="font-medium">{getFullName(relation.athlete)}</p>
              <p className="text-sm text-muted-foreground">
                {relation.athlete.email}
              </p>
            </div>
          </div>
        ))}
      </div>

      {invitations && invitations.length > 0 && (
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">Invitations en attente</h2>
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">{invitation.email}</p>
                <p className="text-sm text-muted-foreground">
                  Envoyée le {format(new Date(invitation.created_at), 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => resendInvitationMutation.mutate(invitation.id)}
                >
                  Relancer
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => deleteInvitationMutation.mutate(invitation.id)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
};

export default Athletes;