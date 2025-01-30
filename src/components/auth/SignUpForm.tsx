import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "athlete" | "coach" | "individual_athlete";

export const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<UserRole>("athlete");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!email || !password || !firstName || !lastName) {
        toast({
          variant: "destructive",
          title: "Erreur d'inscription",
          description: "Veuillez remplir tous les champs",
        });
        return;
      }

      console.log("Tentative d'inscription avec:", { email, role, firstName, lastName });

      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        toast({
          variant: "destructive",
          title: "Erreur d'inscription",
          description: "Un compte existe déjà avec cet email. Veuillez vous connecter.",
        });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role,
          },
        },
      });

      if (error) {
        console.error("Erreur lors de l'inscription:", error);
        
        let errorMessage = "Une erreur est survenue lors de la création du compte";
        
        if (error.message?.includes("already registered")) {
          errorMessage = "Un compte existe déjà avec cet email. Veuillez vous connecter.";
        }

        toast({
          variant: "destructive",
          title: "Erreur d'inscription",
          description: errorMessage,
        });
        return;
      }

      if (data.user) {
        console.log("Inscription réussie:", data.user);
        toast({
          title: "Compte créé avec succès",
          description: "Vous allez être redirigé vers votre tableau de bord",
        });
      }
      
    } catch (error: any) {
      console.error("Erreur complète lors de l'inscription:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: "Une erreur est survenue lors de la création du compte",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-firstName">Prénom</Label>
        <Input
          id="signup-firstName"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-lastName">Nom</Label>
        <Input
          id="signup-lastName"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Mot de passe</Label>
        <Input
          id="signup-password"
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
            <RadioGroupItem value="athlete" id="signup-athlete" />
            <Label htmlFor="signup-athlete">Athlète</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="individual_athlete" id="signup-individual-athlete" />
            <Label htmlFor="signup-individual-athlete">Athlète individuel</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="coach" id="signup-coach" />
            <Label htmlFor="signup-coach">Coach</Label>
          </div>
        </RadioGroup>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Création du compte..." : "Créer un compte"}
      </Button>
    </form>
  );
};