import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

const Login = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || "/";

  console.log("Login page - Auth state:", { 
    user, 
    userRole: user?.role, 
    isAuthenticated, 
    isLoading,
    from 
  });

  useEffect(() => {
    // If user becomes authenticated while on this page, redirect them
    if (isAuthenticated && user && user.role && !isLoading) {
      console.log("User authenticated while on login page, redirecting");
      
      // If we have a URL of redirection stored in location.state, use it
      if (from && from !== "/login") {
        console.log("Redirecting to stored location:", from);
        navigate(from, { replace: true });
      } else {
        // Otherwise, redirect based on role
        const defaultPath = 
          user.role === 'individual_athlete' ? '/individual-athlete' :
          user.role === 'coach' ? '/coach' :
          user.role === 'admin' ? '/admin/users' :
          user.role === 'athlete' ? '/athlete' : '/';
            
        console.log("Redirecting to default path:", defaultPath);
        navigate(defaultPath, { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, from, navigate]);

  // Wait for authentication to be checked before rendering content
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Chargement...</p>
        </div>
      </div>
    );
  }

  // Render the login page content for non-authenticated users
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
