
import { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Trash2, CalendarClock, Award, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type AthleteCardProps = {
  athlete: Profile;
  onEdit: (athlete: Profile) => void;
  onViewCompetitions: (athlete: Profile) => void;
  onDelete: (athlete: Profile) => void;
};

export const AthleteCard = ({ 
  athlete, 
  onEdit, 
  onViewCompetitions, 
  onDelete 
}: AthleteCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {athlete.avatar_url ? (
              <img 
                src={athlete.avatar_url} 
                alt={`${athlete.first_name} ${athlete.last_name}`} 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <span>{athlete.first_name} {athlete.last_name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onDelete(athlete)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground mb-2">{athlete.email}</p>
        {athlete.bio && (
          <p className="mt-2 text-sm line-clamp-2">{athlete.bio}</p>
        )}
        {athlete.created_at && (
          <p className="text-xs text-muted-foreground mt-2">
            Ajouté le {format(new Date(athlete.created_at), "d MMMM yyyy", { locale: fr })}
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onEdit(athlete)}
        >
          <CalendarClock className="h-4 w-4 mr-2" />
          Programmes
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onViewCompetitions(athlete)}
        >
          <Award className="h-4 w-4 mr-2" />
          Compétitions
        </Button>
      </CardFooter>
    </Card>
  );
};
