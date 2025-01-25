import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Chargement...</div>;
  }

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Utilisateur';
  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profil</h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">{fullName}</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Rôle</h3>
            <p className="text-muted-foreground capitalize">{user.role}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;