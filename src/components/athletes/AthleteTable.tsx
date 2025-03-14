
import { Profile } from "@/types/database";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CalendarClock, Award, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
