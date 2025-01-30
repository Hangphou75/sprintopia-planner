import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

type UserRole = "athlete" | "coach" | "individual_athlete";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("coach");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("Tentative de connexion avec:", { email, password, role });
      await login(email, password, role);
      toast.success("Connexion réussie");
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      toast.error("Erreur de connexion: " + (error.message || "Email ou mot de passe incorrect"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label>Rôle</Label>
        <RadioGroup value={role} onValueChange={(value: UserRole) => setRole(value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="athlete" id="athlete" disabled={isLoading} />
            <Label htmlFor="athlete">Athlète</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="individual_athlete" id="individual_athlete" disabled={isLoading} />
            <Label htmlFor="individual_athlete">Athlète individuel</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="coach" id="coach" disabled={isLoading} />
            <Label htmlFor="coach">Coach</Label>
          </div>
        </RadioGroup>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Connexion en cours..." : "Se connecter"}
      </Button>
    </form>
  );
};