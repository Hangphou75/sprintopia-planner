import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, Calendar, User, LogOut } from "lucide-react";
import { toast } from "sonner";

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const baseRoute = `/${user.role}`;
  const isActive = (path: string) => location.pathname === `${baseRoute}/${path}`;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <Sidebar>
          <SidebarContent>
            <div className="space-y-4 py-4">
              <div className="px-4 py-2">
                <h2 className="text-lg font-semibold tracking-tight">Sprintopia</h2>
                <p className="text-sm text-muted-foreground">
                  {user.role === "athlete" ? "Athlete" : "Coach"} Dashboard
                </p>
              </div>
              <nav className="space-y-2 px-2">
                <Link to={`${baseRoute}/home`}>
                  <Button
                    variant={isActive("home") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </Link>
                <Link to={`${baseRoute}/planning`}>
                  <Button
                    variant={isActive("planning") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Planning
                  </Button>
                </Link>
                <Link to={`${baseRoute}/profile`}>
                  <Button
                    variant={isActive("profile") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </Link>
              </nav>
              <div className="px-2 mt-auto">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;