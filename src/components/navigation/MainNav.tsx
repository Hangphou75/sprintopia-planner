
import { Link, useLocation } from "react-router-dom";
import { UserCircle, Shield } from "lucide-react";
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

  return (
    <nav className="grid gap-2 px-2">
      {isAdmin && (
        <div className="mb-4">
          <h4 className="mb-1 px-2 text-sm font-semibold">Administration</h4>
          <Link
            to="/admin"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
              location.pathname.startsWith("/admin") ? "bg-gray-100" : ""
            }`}
          >
            <Shield className="h-4 w-4" />
            Gestion des profils
          </Link>
        </div>
      )}

      {isCoach ? (
        <>
          <h4 className="mb-1 px-2 text-sm font-semibold">Coach</h4>
          <Link
            to="/coach"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
              location.pathname === "/coach" ? "bg-gray-100" : ""
            }`}
          >
            Accueil
          </Link>
          <Link
            to="/coach/athletes"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
              location.pathname === "/coach/athletes" ? "bg-gray-100" : ""
            }`}
          >
            Mes athlètes
          </Link>
          <Link
            to="/coach/planning"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
              location.pathname === "/coach/planning" ? "bg-gray-100" : ""
            }`}
          >
            Planning
          </Link>
        </>
      ) : isIndividualAthlete ? (
        <>
          <Link
            to="/individual-athlete"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
              location.pathname === "/individual-athlete" ? "bg-gray-100" : ""
            }`}
          >
            Accueil
          </Link>
          <Link
            to="/individual-athlete/planning"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
              location.pathname === "/individual-athlete/planning" ? "bg-gray-100" : ""
            }`}
          >
            Planning
          </Link>
        </>
      ) : (
        <>
          <Link
            to="/athlete"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
              location.pathname === "/athlete" ? "bg-gray-100" : ""
            }`}
          >
            Accueil
          </Link>
          <Link
            to="/athlete/planning"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
              location.pathname === "/athlete/planning" ? "bg-gray-100" : ""
            }`}
          >
            Planning
          </Link>
        </>
      )}
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
