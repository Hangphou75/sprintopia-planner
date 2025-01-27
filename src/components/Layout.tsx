import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const isCoach = user.role === "coach";

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarContent className="flex flex-col h-full">
            <div className="flex-1 py-6 space-y-4">
              <nav className="grid gap-2 px-2">
                {isCoach ? (
                  <>
                    <Link
                      to="/coach"
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
                        location.pathname === "/coach" ? "bg-gray-100" : ""
                      }`}
                    >
                      Accueil
                    </Link>
                    <Link
                      to="/coach/athletes"
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
                        location.pathname === "/coach/athletes" ? "bg-gray-100" : ""
                      }`}
                    >
                      Mes athlètes
                    </Link>
                    <Link
                      to="/coach/planning"
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
                        location.pathname === "/coach/planning" ? "bg-gray-100" : ""
                      }`}
                    >
                      Planning
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/athlete"
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
                        location.pathname === "/athlete" ? "bg-gray-100" : ""
                      }`}
                    >
                      Accueil
                    </Link>
                    <Link
                      to="/athlete/planning"
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
                        location.pathname === "/athlete/planning" ? "bg-gray-100" : ""
                      }`}
                    >
                      Planning
                    </Link>
                  </>
                )}
              </nav>
            </div>
            <div className="p-4">
              <Button onClick={handleLogout} variant="outline" className="w-full">
                Déconnexion
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;