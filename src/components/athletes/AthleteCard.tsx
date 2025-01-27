import { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit2 } from "lucide-react";

type AthleteCardProps = {
  athlete: Profile;
  onEdit: (athlete: Profile) => void;
  onDelete: (athlete: Profile) => void;
};

export const AthleteCard = ({ athlete, onEdit, onDelete }: AthleteCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{athlete.first_name} {athlete.last_name}</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(athlete)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(athlete)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{athlete.email}</p>
        {athlete.bio && (
          <p className="mt-2 text-sm">{athlete.bio}</p>
        )}
      </CardContent>
    </Card>
  );
};