import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

type UserRole = "athlete" | "coach";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("coach");
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Tentative de connexion avec:", { email, password, role });
    
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      await login(email, password, role);
      console.log("Login réussi");
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      toast.error("Erreur de connexion: " + (error.message || "Email ou mot de passe incorrect"));
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
        />
      </div>
      <div className="space-y-2">
        <Label>Rôle</Label>
        <RadioGroup value={role} onValueChange={(value: UserRole) => setRole(value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="athlete" id="athlete" />
            <Label htmlFor="athlete">Athlète</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="coach" id="coach" />
            <Label htmlFor="coach">Coach</Label>
          </div>
        </RadioGroup>
      </div>
      <Button type="submit" className="w-full">
        Se connecter
      </Button>
    </form>
  );
};