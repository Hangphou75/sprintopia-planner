import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CoachHome = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, Coach!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No active programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Managed Athletes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No athletes under management</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoachHome;