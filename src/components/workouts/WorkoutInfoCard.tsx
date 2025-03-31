
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkoutInfoCardProps {
  title: string;
  date: string | Date;
  time?: string;
  theme?: string;
  description?: string;
}

export const WorkoutInfoCard = ({
  title,
  date,
  time,
  theme,
  description,
}: WorkoutInfoCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span>
            {format(new Date(date), "EEEE dd MMMM yyyy", {
              locale: fr,
            })}
          </span>
        </div>
        {time && (
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span>{time}</span>
          </div>
        )}
        {theme && (
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-muted-foreground" />
            <span>
              <Badge variant="outline">{theme}</Badge>
            </span>
          </div>
        )}
        {description && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
