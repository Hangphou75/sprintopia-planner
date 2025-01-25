import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Competition = {
  id: string;
  name: string;
  date: string;
  distance: string;
  level: string;
  location?: string | null;
  is_main: boolean;
};

type CompetitionCardProps = {
  competition: Competition;
  onEdit: (competition: Competition) => void;
  onDelete: (competition: Competition) => void;
};

export const CompetitionCard = ({
  competition,
  onEdit,
  onDelete,
}: CompetitionCardProps) => {
  const formattedDate = format(new Date(competition.date), "d MMMM yyyy", {
    locale: fr,
  });

  const levelLabels = {
    local: "Local",
    regional: "Régional",
    national: "National",
    international: "International",
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">
              {competition.name}
            </CardTitle>
          </div>
          {competition.is_main && (
            <span className="text-xs font-medium text-muted-foreground">
              Principale
            </span>
          )}
        </div>
        <CardDescription>
          {formattedDate} • {competition.distance}m • {levelLabels[competition.level as keyof typeof levelLabels]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {competition.location && (
          <p className="text-sm text-muted-foreground mb-4">
            Lieu : {competition.location}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(competition)}
          >
            Modifier
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. La compétition sera définitivement supprimée.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(competition)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};