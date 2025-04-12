
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Effectuer la déconnexion d'abord
      await logout();
      
      // Une fois la déconnexion réussie, naviguer vers la page de connexion
      // Utiliser replace: true pour éviter de revenir à l'état précédent lors de la navigation arrière
      navigate("/login", { replace: true });
      
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <Button onClick={handleLogout} variant="outline" className="w-full">
      Déconnexion
    </Button>
  );
};
