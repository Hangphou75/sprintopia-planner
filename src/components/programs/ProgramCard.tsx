import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Program } from "@/types/program";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Dumbbell } from "lucide-react";

type ProgramCardProps = {
  program: Program;
  readOnly?: boolean;
  onDelete?: () => void;
};

export const ProgramCard = ({ program, readOnly = false, onDelete }: ProgramCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  const handleClick = () => {
    if (readOnly) {
      // Si l'utilisateur est un athlète, rediriger vers la page des séances
      if (profile?.role === 'athlete') {
        navigate(`/athlete/workouts`);
      } else {
        navigate(`/coach/programs/${program.id}/workouts`);
      }
    } else {
      navigate(`/coach/programs/${program.id}/edit`);
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow relative group"
      onClick={handleClick}
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Dumbbell className="h-5 w-5 text-muted-foreground" />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          {program.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="text-sm font-medium">Objectifs</p>
          <p className="text-sm text-muted-foreground">{program.objectives || "Aucun objectif défini"}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Durée</p>
          <p className="text-sm text-muted-foreground">{program.duration} semaines</p>
        </div>
        <div>
          <p className="text-sm font-medium">Date de début</p>
          <p className="text-sm text-muted-foreground">
            {new Date(program.start_date).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};