import { Link, useLocation } from "react-router-dom";
import { UserCircle, Shield, Users, Calendar, Home, PanelLayoutTop, CalendarDays, BarChart, User } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface MainNavProps {
  isCoach: boolean;
  basePath: string;
}

export const MainNav = ({ isCoach, basePath }: MainNavProps) => {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();
  const isIndividualAthlete = basePath === "/individual-athlete";
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const coachRoutes = [
    {
      href: "/coach",
      label: "Tableau de bord",
      icon: <Home className="h-4 w-4" />,
    },
    {
      href: "/coach/athletes",
      label: "Athlètes",
      icon: <Users className="h-4 w-4" />,
    },
    {
      href: "/coach/programs",
      label: "Programmes",
      icon: <PanelLayoutTop className="h-4 w-4" />,
    },
    {
      href: "/coach/planning",
      label: "Planning",
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      href: "/coach/feedback",
      label: "Suivi des feedbacks",
      icon: <BarChart className="h-4 w-4" />,
    },
    {
      href: "/coach/profile",
      label: "Profil",
      icon: <User className="h-4 w-4" />,
    },
  ];

  return (
    <nav className="grid gap-2 px-2">
      {isAdmin && (
        <div className="mb-4">
          <h4 className="mb-1 px-2 text-sm font-semibold">Administration</h4>
          <Link
            to="/admin"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
              location.pathname === "/admin" ? "bg-gray-100" : ""
            }`}
          >
            <Shield className="h-4 w-4" />
            Tableau de bord admin
          </Link>
          <Link
            to="/admin/users"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
              location.pathname === "/admin/users" ? "bg-gray-100" : ""
            }`}
          >
            <Users className="h-4 w-4" />
            Utilisateurs
          </Link>
        </div>
      )}

      {(isCoach || isAdmin) && (
        <>
          <h4 className="mb-1 px-2 text-sm font-semibold">Coach</h4>
          {coachRoutes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
                location.pathname === route.href ? "bg-gray-100" : ""
              }`}
            >
              {route.icon}
              {route.label}
            </Link>
          ))}
        </>
      )}
      {!isCoach && !isAdmin && isIndividualAthlete ? (
        <>
          <Link
            to="/individual-athlete"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
              location.pathname === "/individual-athlete" ? "bg-gray-100" : ""
            }`}
          >
            <Home className="h-4 w-4" />
            Accueil
          </Link>
          <Link
            to="/individual-athlete/planning"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
              location.pathname === "/individual-athlete/planning" ? "bg-gray-100" : ""
            }`}
          >
            <Calendar className="h-4 w-4" />
            Planning
          </Link>
        </>
      ) : (!isCoach && !isAdmin) ? (
        <>
          <Link
            to="/athlete"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
              location.pathname === "/athlete" ? "bg-gray-100" : ""
            }`}
          >
            <Home className="h-4 w-4" />
            Accueil
          </Link>
          <Link
            to="/athlete/planning"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
              location.pathname === "/athlete/planning" ? "bg-gray-100" : ""
            }`}
          >
            <Calendar className="h-4 w-4" />
            Planning
          </Link>
        </>
      ) : null}
      
      <Link
        to={`${basePath}/profile`}
        onClick={handleLinkClick}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
          location.pathname.includes("/profile") ? "bg-gray-100" : ""
        }`}
      >
        <UserCircle className="h-4 w-4" />
        Profil
      </Link>
    </nav>
  );
};
