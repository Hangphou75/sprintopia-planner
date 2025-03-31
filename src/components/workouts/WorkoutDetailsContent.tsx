
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkoutDetailsContentProps {
  details: any;
}

export const WorkoutDetailsContent = ({ details }: WorkoutDetailsContentProps) => {
  if (!details) return null;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Détails de la séance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap text-sm">
          {typeof details === 'string' 
            ? details 
            : JSON.stringify(details, null, 2)}
        </div>
      </CardContent>
    </Card>
  );
};
