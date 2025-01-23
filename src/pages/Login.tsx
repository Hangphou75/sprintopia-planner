import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Login = () => {
  const { user, isAuthenticated } = useAuth();
  
  console.log("Login page rendering - Auth state:", { isAuthenticated, user });

  // Ajout d'un div avec une classe bg-background pour s'assurer que le fond est visible
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4" style={{ minHeight: '100vh' }}>
      {isAuthenticated && user ? (
        <>
          {console.log("User is authenticated, redirecting to:", `/${user.role}/home`)}
          <Navigate to={`/${user.role}/home`} replace />
        </>
      ) : (
        <Card className="w-[400px] shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Bienvenue sur Sprintopia</CardTitle>
            <CardDescription>
              Connectez-vous ou créez un compte pour continuer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>

              <TabsContent value="signup">
                <SignUpForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Login;