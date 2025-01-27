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

const Layout = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const isCoach = user.role === "coach";
  const basePath = isCoach ? "/coach" : "/athlete";

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar variant="sidebar" collapsible="offcanvas">
          <SidebarContent>
            <SidebarHeader className="flex items-center justify-between p-4">
              <span className="font-semibold">Sprintopia</span>
              <SidebarTrigger />
            </SidebarHeader>
            <div className="flex-1 py-6 space-y-4">
              <MainNav isCoach={isCoach} basePath={basePath} />
            </div>
            <div className="p-4">
              <LogoutButton />
            </div>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <SidebarTrigger />
            <div className="flex-1" />
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