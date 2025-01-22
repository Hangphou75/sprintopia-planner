import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"athlete" | "coach">("athlete");
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password, role);
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect",
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const { data, error: signUpError } = await supabase.auth.signUp({
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

      if (signUpError) {
        console.error("Erreur détaillée:", signUpError);
        
        // Parse the error response body
        let errorMessage = "Une erreur est survenue lors de la création du compte";
        
        try {
          // The error might be in signUpError.message or in the body property
          const errorBody = signUpError.message && typeof signUpError.message === 'string'
            ? JSON.parse(signUpError.message)
            : null;

          // Check both the parsed error body and the original error
          if (errorBody?.code === "user_already_exists" || 
              signUpError.message?.includes("already registered")) {
            errorMessage = "Un compte existe déjà avec cet email. Veuillez vous connecter.";
          }
        } catch (parseError) {
          console.error("Erreur lors du parsing de l'erreur:", parseError);
        }

        toast({
          variant: "destructive",
          title: "Erreur d'inscription",
          description: errorMessage,
        });
        return;
      }

      if (data) {
        console.log("Inscription réussie:", data);
        toast({
          title: "Compte créé avec succès",
          description: "Vous pouvez maintenant vous connecter",
        });
      }
    } catch (error) {
      console.error("Erreur complète lors de l'inscription:", error);
      toast({
        variant: "destructive",
        title: "Erreur lors de l'inscription",
        description: "Une erreur est survenue lors de la création du compte",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Bienvenue sur Sprintopia</CardTitle>
          <CardDescription>Connectez-vous ou créez un compte pour continuer</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
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
                  <RadioGroup value={role} onValueChange={(value: "athlete" | "coach") => setRole(value)}>
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
            </TabsContent>

            <TabsContent value="signup">
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
                  <RadioGroup value={role} onValueChange={(value: "athlete" | "coach") => setRole(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="athlete" id="signup-athlete" />
                      <Label htmlFor="signup-athlete">Athlète</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="coach" id="signup-coach" />
                      <Label htmlFor="signup-coach">Coach</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button type="submit" className="w-full">Créer un compte</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;