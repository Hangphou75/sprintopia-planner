import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Program } from "@/types/program";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type ProgramCardProps = {
  program: Program;
  readOnly?: boolean;
  onDelete?: () => void;
  onShare?: (programId: string) => void;
};

export const ProgramCard = ({ program, readOnly = false }: ProgramCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = () => {
    if (!user?.role || !program.id) {
      console.error("Missing user role or program ID");
      return;
    }

    console.log("Handling program card click for role:", user.role);
    
    let path;
    switch (user.role) {
      case 'individual_athlete':
        path = `/individual-athlete/programs/${program.id}/workouts`;
        break;
      case 'athlete':
        path = `/athlete/programs/${program.id}/workouts`;
        break;
      case 'coach':
        path = `/coach/programs/${program.id}/workouts`;
        break;
      default:
        console.error("Unknown user role:", user.role);
        return;
    }

    console.log("Navigating to:", path);
    navigate(path);
  };

  return (
    <Card 
      className="h-full hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <span className="font-semibold">{program.name}</span>
          </div>
          {program.shared_programs && program.shared_programs.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {program.shared_programs.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Objectifs</p>
          <p className="text-sm">{program.objectives || "Aucun objectif défini"}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Durée</p>
            <p className="text-sm">{program.duration} semaines</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Date de début</p>
            <p className="text-sm">
              {format(new Date(program.start_date), "dd MMM yyyy", { locale: fr })}
            </p>
          </div>
        </div>
        {program.shared_programs && program.shared_programs.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Athlètes</p>
            <div className="space-y-1">
              {program.shared_programs.map((shared) => (
                <p key={shared.athlete.id} className="text-sm text-muted-foreground">
                  {shared.athlete.first_name} {shared.athlete.last_name}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};