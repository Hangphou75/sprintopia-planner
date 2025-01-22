import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AthleteHome = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, Athlete!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Program</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No active program</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Competition</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No upcoming competitions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AthleteHome;