import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const CoachProfile = () => {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">Name</p>
            <p className="text-gray-500">{user?.name}</p>
          </div>
          <div>
            <p className="font-medium">Email</p>
            <p className="text-gray-500">{user?.email}</p>
          </div>
          <div>
            <p className="font-medium">Role</p>
            <p className="text-gray-500 capitalize">{user?.role}</p>
          </div>
          <Button variant="destructive" onClick={logout}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoachProfile;