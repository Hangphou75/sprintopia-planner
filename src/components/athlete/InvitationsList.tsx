import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const InvitationsList = () => {
  const { user } = useAuth();

  console.log("Current user:", user); // Debug log pour voir l'utilisateur actuel

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["athlete-invitations", user?.email],
    queryFn: async () => {
      console.log("Fetching invitations for email:", user?.email);

      if (!user?.email) {
        console.error("No user email available");
        return [];
      }

      const { data, error } = await supabase
        .from("athlete_invitations")
        .select(`
          *,
          coach:profiles!athlete_invitations_coach_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq("email", user.email)
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching invitations:", error);
        throw error;
      }

      console.log("Raw invitations data:", data);
      return data || [];
    },
    enabled: !!user?.email,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  const handleAcceptInvitation = async (invitationId: string, coachId: string) => {
    try {
      console.log("Accepting invitation:", invitationId, "from coach:", coachId);

      const { error: updateError } = await supabase
        .from("athlete_invitations")
        .update({ status: "accepted" })
        .eq("id", invitationId);

      if (updateError) throw updateError;

      const { error: relationError } = await supabase
        .from("coach_athletes")
        .insert({
          coach_id: coachId,
          athlete_id: user?.id,
        });

      if (relationError) throw relationError;

      toast.success("Invitation acceptée avec succès");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("Erreur lors de l'acceptation de l'invitation");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chargement des invitations...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aucune invitation en attente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Vous n'avez pas d'invitation en attente pour le moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitations en attente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <p className="font-medium">
                {invitation.coach.first_name} {invitation.coach.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                vous invite à rejoindre son équipe
              </p>
              <p className="text-xs text-muted-foreground">
                Envoyé le {format(new Date(invitation.created_at), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
            <Button
              onClick={() => handleAcceptInvitation(invitation.id, invitation.coach_id)}
            >
              Accepter
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};