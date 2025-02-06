
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CompetitionProps = {
  competition: {
    name: string;
    date: string;
    location?: string;
    distance: string;
    level: string;
    time?: string;
  };
};

export const UpcomingCompetition = ({ competition }: CompetitionProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Compétition cette semaine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{competition.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(competition.date), "d MMMM yyyy", { locale: fr })}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>{competition.distance}m • {
              competition.level === "local" ? "Local" :
              competition.level === "regional" ? "Régional" :
              competition.level === "national" ? "National" :
              "International"
            }</p>
            {competition.location && (
              <p className="mt-1">Lieu : {competition.location}</p>
            )}
            {competition.time && (
              <p className="mt-1">Heure : {competition.time}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
