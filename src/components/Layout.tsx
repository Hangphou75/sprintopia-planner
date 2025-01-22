import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, Calendar, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Layout = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return null;
  }

  const baseRoute = `/${user.role}`;
  const isActive = (path: string) => location.pathname === `${baseRoute}/${path}`;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <div className="space-y-4 py-4">
              <div className="px-4 py-2">
                <h2 className="text-lg font-semibold tracking-tight">Sprintopia</h2>
                <p className="text-sm text-gray-500">{user.role === "athlete" ? "Athlete" : "Coach"} Dashboard</p>
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
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-8">
          <SidebarTrigger />
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;