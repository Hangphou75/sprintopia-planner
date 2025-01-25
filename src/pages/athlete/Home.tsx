import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvitationsList } from "@/components/athlete/InvitationsList";

const Home = () => {
  const { user } = useAuth();

  const { data: activeProgram } = useQuery({
    queryKey: ["active-program", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("active_programs")
        .select(
          `
          *,
          programs (
            *
          )
        `
        )
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      <InvitationsList />

      {activeProgram?.programs && (
        <Card>
          <CardHeader>
            <CardTitle>Programme en cours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">
              {activeProgram.programs.name}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Home;