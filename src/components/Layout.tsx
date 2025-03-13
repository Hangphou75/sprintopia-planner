
import { Outlet } from "react-router-dom";
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

const Layout = () => {
  const { user, isLoading } = useAuth();

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

  if (!user) {
    return null;
  }

  // For admin users, we want to provide access to both admin and coach interfaces
  // So we set isCoach to true for admin users as well
  const isCoach = user.role === "coach" || user.role === "admin";
  
  // For profile navigation, we still need to use the right base path
  const basePath = user.role === "individual_athlete" 
    ? "/individual-athlete" 
    : user.role === "admin" 
      ? "/admin" 
      : isCoach 
        ? "/coach" 
        : "/athlete";

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
