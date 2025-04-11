
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoachCalendar } from "@/components/coach/CoachCalendar";
import { ManagedAthletes } from "@/components/coach/ManagedAthletes";
import { WeeklyCompetitions } from "@/components/coach/WeeklyCompetitions";
import { WeatherWidget } from "@/components/weather/WeatherWidget";

const CoachHome = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">
        {isAdmin ? "Tableau de bord Coach (Admin)" : "Tableau de bord"}
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendrier des programmes</CardTitle>
          </CardHeader>
          <CardContent>
            <CoachCalendar coachId={user?.id} />
          </CardContent>
        </Card>

        {/* Widget Météo */}
        <div className="lg:col-span-1">
          <WeatherWidget />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mes athlètes</CardTitle>
          </CardHeader>
          <CardContent>
            <ManagedAthletes coachId={user?.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compétitions de la semaine</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyCompetitions coachId={user?.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoachHome;
