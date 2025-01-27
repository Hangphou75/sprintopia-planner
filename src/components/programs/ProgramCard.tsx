import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Program } from "@/types/program";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CalendarDays, Users, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ProgramCardProps = {
  program: Program;
  readOnly?: boolean;
  onDelete?: () => void;
  onShare?: () => void;
};

export const ProgramCard = ({ program, readOnly = false, onDelete, onShare }: ProgramCardProps) => {
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

    const basePath = user.role === 'athlete' ? '/athlete' : '/coach';
    const path = `${basePath}/programs/${program.id}/workouts`;
    
    console.log("Navigation path:", path);
    navigate(path);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
    >
      <CardHeader onClick={handleClick}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {program.name}
          </div>
          {program.shared_programs && program.shared_programs.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {program.shared_programs.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent onClick={handleClick} className="space-y-2">
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
        {program.shared_programs && program.shared_programs.length > 0 && (
          <div>
            <p className="text-sm font-medium">Athlètes</p>
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
      {user?.role === 'coach' && (
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onShare?.();
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Associer
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};