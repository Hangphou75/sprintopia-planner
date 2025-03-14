
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Calendar, 
  Dumbbell, 
  Award, 
  UserCog, 
  LayoutGrid, 
  BarChart3,
  MessageSquare
} from "lucide-react";

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  isActive?: (pathname: string) => boolean;
};

interface MainNavProps {
  isCoach: boolean;
  basePath: string;
}

export function MainNav({ isCoach, basePath }: MainNavProps) {
  const [pathname, setPathname] = useState(window.location.pathname);

  const coachItems: NavItem[] = [
    {
      title: "Tableau de bord",
      href: "/coach",
      icon: <Home className="h-5 w-5" />,
      isActive: (path) => path === "/coach",
    },
    {
      title: "Athlètes",
      href: "/coach/athletes",
      icon: <Users className="h-5 w-5" />,
      isActive: (path) => path.startsWith("/coach/athletes"),
    },
    {
      title: "Programmes",
      href: "/coach/programs",
      icon: <LayoutGrid className="h-5 w-5" />,
      isActive: (path) => path.startsWith("/coach/programs"),
    },
    {
      title: "Planning",
      href: "/coach/planning",
      icon: <Calendar className="h-5 w-5" />,
      isActive: (path) => path === "/coach/planning",
    },
    {
      title: "Feedbacks",
      href: "/coach/feedback",
      icon: <MessageSquare className="h-5 w-5" />,
      isActive: (path) => path === "/coach/feedback",
    },
  ];

  const athleteItems: NavItem[] = [
    {
      title: "Mon planning",
      href: `${basePath}/planning`,
      icon: <Calendar className="h-5 w-5" />,
      isActive: (path) => path.includes("/planning"),
    },
    {
      title: "Mes programmes",
      href: `${basePath}/programs`,
      icon: <Dumbbell className="h-5 w-5" />,
      isActive: (path) => path.includes("/programs") && !path.includes("/planning"),
    },
    {
      title: "Mes statistiques",
      href: `${basePath}/stats`,
      icon: <BarChart3 className="h-5 w-5" />,
      isActive: (path) => path.includes("/stats"),
    },
  ];

  const items = isCoach ? coachItems : athleteItems;

  return (
    <div className="flex flex-col p-2">
      <nav className="grid items-start gap-2 px-2">
        {items.map((item, index) => (
          <NavLink
            key={index}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                isActive
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )
            }
            onClick={() => setPathname(item.href)}
          >
            {item.icon}
            <p className="text-sm font-medium">{item.title}</p>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
