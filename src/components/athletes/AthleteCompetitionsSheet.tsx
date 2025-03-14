
import { useEffect } from "react";
import { Profile } from "@/types/database";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Trophy, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AthleteCompetitionsSheetProps = {
  selectedAthlete: Profile | null;
  onOpenChange: (athlete: Profile | null) => void;
};

export const AthleteCompetitionsSheet = ({
  selectedAthlete,
  onOpenChange,
}: AthleteCompetitionsSheetProps) => {
  const { data: competitions, isLoading } = useQuery({
    queryKey: ["athlete-competitions", selectedAthlete?.id],
    queryFn: async () => {
      if (!selectedAthlete?.id) return [];

      // Get programs shared with this athlete
      const { data: sharedPrograms } = await supabase
        .from("shared_programs")
        .select("program_id")
        .eq("athlete_id", selectedAthlete.id);

      if (!sharedPrograms?.length) return [];
      
      const programIds = sharedPrograms.map(sp => sp.program_id);
      
      // Get competitions from those programs
      const { data: competitions, error } = await supabase
        .from("competitions")
        .select(`
          *,
          program:programs (
            name,
            objectives
          )
        `)
        .in("program_id", programIds)
        .order("date", { ascending: true });
        
      if (error) throw error;
      
      return competitions;
    },
    enabled: !!selectedAthlete?.id,
  });

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      onOpenChange(null);
    }
  };

  // Group competitions by upcoming/past
  const upcomingCompetitions = competitions?.filter(
    comp => new Date(comp.date) >= new Date()
  ) || [];

  const pastCompetitions = competitions?.filter(
    comp => new Date(comp.date) < new Date()
  ) || [];

  return (
    <Sheet open={!!selectedAthlete} onOpenChange={handleSheetOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            Compétitions de {selectedAthlete?.first_name} {selectedAthlete?.last_name}
          </SheetTitle>
          <SheetDescription>
            Calendrier complet des compétitions
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin h-6 w-6 border-t-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Compétitions à venir ({upcomingCompetitions.length})
                </h3>
                {upcomingCompetitions.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingCompetitions.map(competition => (
                      <Card key={competition.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex justify-between items-start">
                            <span>{competition.name}</span>
                            <Badge className="ml-2">
                              {competition.distance}m
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-sm space-y-1">
                            <p className="font-medium">
                              {format(new Date(competition.date), "d MMMM yyyy", { locale: fr })}
                              {competition.time && ` à ${competition.time}`}
                            </p>
                            {competition.location && (
                              <p className="flex items-center text-muted-foreground">
                                <MapPin className="h-3 w-3 mr-1" />
                                {competition.location}
                              </p>
                            )}
                            {competition.program?.name && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Programme: {competition.program.name}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Aucune compétition à venir
                  </p>
                )}
              </div>

              {pastCompetitions.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Compétitions passées ({pastCompetitions.length})
                  </h3>
                  <div className="space-y-3">
                    {pastCompetitions.map(competition => (
                      <Card key={competition.id} className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex justify-between items-start">
                            <span>{competition.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {competition.distance}m
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-sm space-y-1">
                            <p className="font-medium">
                              {format(new Date(competition.date), "d MMMM yyyy", { locale: fr })}
                            </p>
                            {competition.location && (
                              <p className="flex items-center text-muted-foreground">
                                <MapPin className="h-3 w-3 mr-1" />
                                {competition.location}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {!upcomingCompetitions.length && !pastCompetitions.length && (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                  <p className="mt-4 text-muted-foreground">
                    Aucune compétition n'est programmée pour cet athlète
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
