import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const InvitationsList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["athlete-invitations", user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("athlete_invitations")
        .select(`
          *,
          coach:profiles!athlete_invitations_coach_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq("email", user?.email)
        .eq("status", "pending");

      if (error) throw error;
      return data;
    },
    enabled: !!user?.email,
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      // First create the coach-athlete relationship
      const { data: invitation } = await supabase
        .from("athlete_invitations")
        .select("coach_id")
        .eq("id", invitationId)
        .single();

      if (!invitation) throw new Error("Invitation not found");

      const { error: relationError } = await supabase
        .from("coach_athletes")
        .insert({
          coach_id: invitation.coach_id,
          athlete_id: user?.id,
        });

      if (relationError) throw relationError;

      // Then update the invitation status
      const { error: updateError } = await supabase
        .from("athlete_invitations")
        .update({ status: "accepted" })
        .eq("id", invitationId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["athlete-invitations"] });
      toast.success("Invitation acceptée avec succès");
    },
    onError: (error) => {
      console.error("Error accepting invitation:", error);
      toast.error("Erreur lors de l'acceptation de l'invitation");
    },
  });

  if (isLoading) {
    return <div>Chargement des invitations...</div>;
  }

  if (!invitations?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitations en attente</CardTitle>
        <CardDescription>
          Acceptez les invitations des coachs pour commencer à collaborer
        </CardDescription>
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
                souhaite devenir votre coach
              </p>
              <p className="text-xs text-muted-foreground">
                Envoyée le {format(new Date(invitation.created_at), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
            <Button
              onClick={() => acceptInvitationMutation.mutate(invitation.id)}
            >
              Accepter
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};