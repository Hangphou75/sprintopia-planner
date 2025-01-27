import { Program } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type AthleteProgramsProps = {
  programs: Program[];
  onDeleteProgram: (programId: string) => void;
};

export const AthletePrograms = ({ programs, onDeleteProgram }: AthleteProgramsProps) => {
  if (programs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Aucun programme associé</p>
    );
  }

  return (
    <div className="space-y-4">
      {programs.map((program) => (
        <Card key={program.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>{program.name}</span>
              <Button variant="ghost" size="icon" onClick={() => onDeleteProgram(program.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Durée:</span> {program.duration} semaines
              </p>
              <p>
                <span className="font-medium">Date de début:</span>{" "}
                {format(new Date(program.start_date), "dd MMMM yyyy", { locale: fr })}
              </p>
              {program.objectives && (
                <p>
                  <span className="font-medium">Objectifs:</span> {program.objectives}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};