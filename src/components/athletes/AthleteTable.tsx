
import { Profile } from "@/types/database";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CalendarClock, Award, Trash2, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

export type AthleteRelation = {
  id: string;
  athlete: Profile;
};

export type AthleteTableProps = {
  athletes: AthleteRelation[];
  onEditAthlete: (athlete: Profile) => void;
  onViewCompetitions: (athlete: Profile) => void;
  onDeleteAthlete: (athlete: Profile) => void;
};

export const AthleteTable = ({
  athletes,
  onEditAthlete,
  onViewCompetitions,
  onDeleteAthlete,
}: AthleteTableProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {athletes.map((relation) => (
          <Card key={relation.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {relation.athlete.avatar_url ? (
                    <img
                      src={relation.athlete.avatar_url}
                      alt={`${relation.athlete.first_name} ${relation.athlete.last_name}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {relation.athlete.first_name} {relation.athlete.last_name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {relation.athlete.email}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteAthlete(relation.athlete)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                Ajouté le{" "}
                {relation.athlete.created_at
                  ? format(
                      new Date(relation.athlete.created_at),
                      "d MMMM yyyy",
                      { locale: fr }
                    )
                  : "-"}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2 p-4 pt-0 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEditAthlete(relation.athlete)}
              >
                <CalendarClock className="h-4 w-4 mr-2" />
                Programmes
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onViewCompetitions(relation.athlete)}
              >
                <Award className="h-4 w-4 mr-2" />
                Compétitions
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Athlète</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Date d'ajout</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {athletes.map((relation) => (
            <TableRow key={relation.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {relation.athlete.avatar_url ? (
                    <img
                      src={relation.athlete.avatar_url}
                      alt={`${relation.athlete.first_name} ${relation.athlete.last_name}`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {relation.athlete.first_name?.[0]}
                        {relation.athlete.last_name?.[0]}
                      </span>
                    </div>
                  )}
                  <span>
                    {relation.athlete.first_name} {relation.athlete.last_name}
                  </span>
                </div>
              </TableCell>
              <TableCell>{relation.athlete.email}</TableCell>
              <TableCell>
                {relation.athlete.created_at
                  ? format(
                      new Date(relation.athlete.created_at),
                      "d MMMM yyyy",
                      { locale: fr }
                    )
                  : "-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAthlete(relation.athlete)}
                  >
                    <CalendarClock className="h-4 w-4 mr-2" />
                    Programmes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewCompetitions(relation.athlete)}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Compétitions
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteAthlete(relation.athlete)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
