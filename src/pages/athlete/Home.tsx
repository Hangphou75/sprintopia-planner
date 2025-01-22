import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

const AthleteHome = () => {
  const { user } = useAuth();

  const { data: activeProgram } = useQuery({
    queryKey: ["active-program", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("active_programs")
        .select("*, programs(*)")
        .eq("user_id", user?.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Programme en cours</CardTitle>
          </CardHeader>
          <CardContent>
            {activeProgram ? (
              <div>
                <h3 className="font-semibold">{activeProgram.programs.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {activeProgram.programs.objectives}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Aucun programme actif</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendrier</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={new Date()}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AthleteHome;