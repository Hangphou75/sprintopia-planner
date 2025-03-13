
import { Link, useLocation } from "react-router-dom";
import { UserCircle, Shield, Users, Calendar, Home } from "lucide-react";
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

  // For admin users, we'll make both admin and coach navigation available
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

      {/* If user is admin or coach, show the coach navigation */}
      {(isCoach || isAdmin) && (
        <>
          <h4 className="mb-1 px-2 text-sm font-semibold">Coach</h4>
          <Link
            to="/coach"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
              location.pathname === "/coach" ? "bg-gray-100" : ""
            }`}
          >
            <Home className="h-4 w-4" />
            Accueil
          </Link>
          <Link
            to="/coach/athletes"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
              location.pathname === "/coach/athletes" ? "bg-gray-100" : ""
            }`}
          >
            <Users className="h-4 w-4" />
            Mes athlètes
          </Link>
          <Link
            to="/coach/planning"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
              location.pathname === "/coach/planning" ? "bg-gray-100" : ""
            }`}
          >
            <Calendar className="h-4 w-4" />
            Planning
          </Link>
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
