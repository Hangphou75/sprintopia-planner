import { Program } from "@/types/program";
import { Button } from "@/components/ui/button";
import { CalendarDays, Edit, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProgramCardProps = {
  program: Program;
};

export const ProgramCard = ({ program }: ProgramCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:border-primary transition-colors">
      <CardHeader>
        <CardTitle>{program.name}</CardTitle>
        <CardDescription>
          {program.duration} semaines - Début le{" "}
          {new Date(program.start_date).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {program.objectives && (
          <p className="text-sm text-card-foreground">{program.objectives}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/coach/programs/${program.id}/edit`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/coach/programs/${program.id}/workouts`)}
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          Séances
        </Button>
        <Button 
          size="sm"
          onClick={() => navigate(`/coach/programs/${program.id}/workouts/new`)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une séance
        </Button>
      </CardFooter>
    </Card>
  );
};