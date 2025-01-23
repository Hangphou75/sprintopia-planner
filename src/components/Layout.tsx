import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, Calendar, User, LogOut } from "lucide-react";
import { toast } from "sonner";

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Si pas d'utilisateur, rediriger vers login avec le chemin actuel
  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const navigation = [
    { name: "Accueil", href: `/${user.role}/home`, icon: Home },
    { name: "Planning", href: `/${user.role}/planning`, icon: Calendar },
    { name: "Profil", href: `/${user.role}/profile`, icon: User },
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar className="border-r">
          <SidebarContent>
            <div className="flex flex-col h-full">
              <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                  <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
                  <div className="space-y-1">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = isActiveRoute(item.href);
                      return (
                        <Link key={item.name} to={item.href}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className="w-full justify-start"
                          >
                            <Icon className="mr-2 h-4 w-4" />
                            {item.name}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-auto p-4">
                <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;