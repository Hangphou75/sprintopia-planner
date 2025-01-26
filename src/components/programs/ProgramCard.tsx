import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Program } from "@/types/program";

type ProgramCardProps = {
  program: Program;
  readOnly?: boolean;
  onDelete?: () => void;
};

export const ProgramCard = ({ program, readOnly = false, onDelete }: ProgramCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  const handleClick = () => {
    if (readOnly) {
      // Si l'utilisateur est un athlète, rediriger vers la page des séances
      if (profile?.role === 'athlete') {
        navigate(`/athlete/workouts`);
      } else {
        navigate(`/coach/programs/${program.id}/workouts`);
      }
    } else {
      navigate(`/coach/programs/${program.id}/edit`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer border rounded-lg p-4 hover:shadow-lg transition-shadow"
    >
      <h3 className="text-lg font-semibold">{program.name}</h3>
      <p className="text-sm text-muted-foreground">{program.objectives}</p>
    </div>
  );
};