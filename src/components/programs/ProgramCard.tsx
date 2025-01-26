import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
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
  const { profile } = useProfile();

  const handleClick = () => {
    console.log("Profile role:", profile?.role); // Debug log
    console.log("Program ID:", program.id); // Debug log
    
    if (profile?.role === 'athlete') {
      console.log("Navigating to athlete workouts"); // Debug log
      navigate(`/athlete/workouts/${program.id}`);
    } else {
      console.log("Navigating to coach workouts"); // Debug log
      navigate(`/coach/programs/${program.id}/workouts`);
    }
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