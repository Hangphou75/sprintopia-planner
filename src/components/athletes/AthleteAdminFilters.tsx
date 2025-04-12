
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users2 } from "lucide-react";

type CoachInfo = {
  id: string;
  name: string;
};

interface AthleteAdminFiltersProps {
  totalAthletes: number;
  coaches: CoachInfo[];
  selectedCoach: string | null;
  onCoachChange: (value: string | null) => void;
}

export const AthleteAdminFilters = ({ 
  totalAthletes, 
  coaches, 
  selectedCoach, 
  onCoachChange 
}: AthleteAdminFiltersProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Vue administrateur</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-muted-foreground" />
            <span>Total des athlètes: {totalAthletes}</span>
          </div>
          
          <div className="flex-1">
            <Select 
              value={selectedCoach || "all_coaches"} 
              onValueChange={value => onCoachChange(value === "all_coaches" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par coach" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_coaches">Tous les coachs</SelectItem>
                {coaches.map(coach => (
                  <SelectItem key={coach.id} value={coach.id}>{coach.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
