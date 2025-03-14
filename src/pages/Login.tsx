import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log("Login page - Auth state:", { 
    user, 
    userRole: user?.role, 
    isAuthenticated, 
    isLoading 
  });
  
  useEffect(() => {
    console.log("Login page mounted - Auth state:", { 
      user, 
      userRole: user?.role, 
      isAuthenticated, 
      isLoading 
    });
  }, [user, isAuthenticated, isLoading]);

  // Wait for authentication to be checked before redirecting
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p>Chargement...</p>
      </div>
    );
  }

  // Only redirect if user is properly authenticated with a valid profile and role
  if (isAuthenticated && user && user.role) {
    console.log("User authenticated with role:", user.role);
    
    // If we have a URL of redirection stored in location.state, use it
    if (location.state?.from) {
      console.log("Redirecting to stored location:", location.state.from);
      return <Navigate to={location.state.from} replace />;
    }

    // Sinon, rediriger vers la page par défaut selon le rôle
    const defaultPath = user.role === 'individual_athlete' 
      ? '/individual-athlete/planning'
      : user.role === 'coach'
        ? '/coach'
        : user.role === 'admin'
          ? '/admin/users'  // Redirect admin to users management page
          : '/athlete';
        
    console.log("Redirecting to default path:", defaultPath);
    return <Navigate to={defaultPath} replace />;
  }

  // If user is not authenticated, show the login page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Bienvenue sur Sprintopia</CardTitle>
          <CardDescription>Connectez-vous ou créez un compte pour continuer</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
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
    </div>
  );
};

export default Login;
