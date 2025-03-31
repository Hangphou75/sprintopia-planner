
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarInset
} from "@/components/ui/sidebar";
import { MainNav } from "@/components/navigation/MainNav";
import { LogoutButton } from "@/components/navigation/LogoutButton";
import { Menu } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useEffect } from "react";

const Layout = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  console.log("Layout - Auth state:", { user, isAuthenticated, isLoading });

  // Si l'utilisateur n'est pas authentifié et que le chargement est terminé, rediriger vers la page de login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("Layout: User not authenticated, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Afficher un écran de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié, on n'affiche pas le layout
  // La redirection sera gérée par l'effet ci-dessus
  if (!isAuthenticated) {
    return null;
  }

  // Pour admin users, we want to provide access to both admin and coach interfaces
  const isCoach = user?.role === "coach" || user?.role === "admin";
  const isAdmin = user?.role === "admin";
  
  // For profile navigation, we need to use the right base path
  let basePath = "/athlete";
  
  if (user?.role === "individual_athlete") {
    basePath = "/individual-athlete";
  } else if (user?.role === "admin") {
    // Pour les admins, utiliser toujours le chemin admin comme base
    basePath = "/admin";
  } else if (user?.role === "coach") {
    basePath = "/coach";
  }

  console.log("Layout navigation setup:", { 
    isCoach, 
    isAdmin,
    basePath,
    currentPath: window.location.pathname 
  });

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar variant="sidebar" collapsible="offcanvas">
          <SidebarContent className="bg-white dark:bg-gray-900 shadow-lg">
            <SidebarHeader className="flex items-center justify-between border-b bg-white dark:bg-gray-900 p-4">
              <Logo />
              <SidebarTrigger className="md:hidden" />
            </SidebarHeader>
            <div className="flex-1 space-y-6 py-6">
              <MainNav isCoach={isCoach} basePath={basePath} />
            </div>
            <div className="border-t p-4">
              <LogoutButton />
            </div>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white dark:bg-gray-900 px-4 shadow-sm md:px-6">
            <SidebarTrigger className="h-10 w-10 md:hidden">
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
            <div className="flex-1 md:hidden">
              <Logo />
            </div>
          </div>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
