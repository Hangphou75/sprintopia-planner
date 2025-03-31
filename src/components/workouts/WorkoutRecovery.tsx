
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkoutRecoveryProps {
  recovery?: string;
}

export const WorkoutRecovery = ({ recovery }: WorkoutRecoveryProps) => {
  if (!recovery) return null;
  
  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Récupération</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{recovery}</p>
      </CardContent>
    </Card>
  );
};
