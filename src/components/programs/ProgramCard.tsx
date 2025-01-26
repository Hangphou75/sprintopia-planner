import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Program } from "@/types/program";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

type ProgramCardProps = {
  program: Program;
  readOnly?: boolean;
  onDelete?: () => void;
};

export const ProgramCard = ({ program, readOnly = false, onDelete }: ProgramCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = () => {
    if (!user?.role || !program.id) {
      console.error("Missing user role or program ID");
      return;
    }

    console.log("Navigating with:", {
      role: user.role,
      programId: program.id,
      currentPath: window.location.pathname
    });

    const path = user.role === 'athlete' 
      ? `/athlete/workouts/${program.id}`
      : `/coach/programs/${program.id}/workouts`;

    console.log("Navigation path:", path);
    navigate(path);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
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