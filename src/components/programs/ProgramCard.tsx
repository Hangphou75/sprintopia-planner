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
    <Card className="w-full hover:border-primary transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold text-left">{program.name}</CardTitle>
        <CardDescription className="text-left text-base">
          {program.duration} semaines - Début le{" "}
          {new Date(program.start_date).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        {program.objectives && (
          <p className="text-base text-left text-muted-foreground">
            {program.objectives}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2 pt-2 border-t">
        <div className="flex gap-2">
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
        </div>
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