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
    <Card className="w-full max-w-md hover:border-primary transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold">{program.name}</CardTitle>
        <CardDescription className="text-base">
          {program.duration} semaines - Début le{" "}
          {new Date(program.start_date).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        {program.objectives && (
          <p className="text-base text-muted-foreground">
            {program.objectives}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 pt-3 border-t">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/coach/programs/${program.id}/edit`)}
          className="flex-1"
        >
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/coach/programs/${program.id}/workouts`)}
          className="flex-1"
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          Séances
        </Button>
        <Button 
          size="sm"
          onClick={() => navigate(`/coach/programs/${program.id}/workouts/new`)}
          className="w-full mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une séance
        </Button>
      </CardFooter>
    </Card>
  );
};