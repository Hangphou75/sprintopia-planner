import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/ProfileForm";

const IndividualAthleteProfile = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mon profil</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default IndividualAthleteProfile;