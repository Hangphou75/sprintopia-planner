import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "athlete" | "coach";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("athlete");
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Tentative de connexion avec:", { email, role });
      
      // Vérifions d'abord si l'utilisateur existe et a le bon rôle
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, email')
        .eq('email', email)
        .single();

      console.log("Profil trouvé:", profile);

      if (profileError || !profile) {
        console.log("Aucun profil trouvé pour cet email");
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: "Email ou mot de passe incorrect",
        });
        return;
      }

      if (profile.role !== role) {
        console.log("Le rôle ne correspond pas:", { demandé: role, actuel: profile.role });
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: "Le rôle sélectionné ne correspond pas à votre compte",
        });
        return;
      }

      await login(email, password, role);
    } catch (error) {
      console.error("Erreur détaillée lors de la connexion:", error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect",
      });
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Mot de passe</Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Rôle</Label>
        <RadioGroup value={role} onValueChange={(value: UserRole) => setRole(value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="athlete" id="login-athlete" />
            <Label htmlFor="login-athlete">Athlète</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="coach" id="login-coach" />
            <Label htmlFor="login-coach">Coach</Label>
          </div>
        </RadioGroup>
      </div>
      <Button type="submit" className="w-full">Se connecter</Button>
    </form>
  );
};