import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent className="flex flex-col h-full">
            <SidebarHeader className="p-4">
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
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;