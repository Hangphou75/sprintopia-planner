import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Chargement...</div>;
  }

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Utilisateur';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profil</h1>
      <div>
        <h2 className="text-xl font-semibold">{fullName}</h2>
        <p className="text-muted-foreground">{user.email}</p>
        <p className="text-muted-foreground capitalize">{user.role}</p>
      </div>
    </div>
  );
};

export default Profile;