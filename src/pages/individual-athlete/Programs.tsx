
import { useAuth } from "@/contexts/AuthContext";
import { useAthletePrograms } from "@/hooks/useAthletePrograms";
import { DeleteProgramDialog } from "./components/DeleteProgramDialog";
import { ProgramsHeader } from "./components/ProgramsHeader";
import { ProgramsList } from "./components/ProgramsList";
import { useProgramActions } from "./hooks/useProgramActions";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Programs() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { data: programs, isLoading, refetch } = useAthletePrograms(user?.id);
  const {
    programToDelete,
    setProgramToDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleCreateProgram,
    handleGenerateProgram,
    handleEditProgram,
    handleDuplicateProgram,
    handleDeleteProgram
  } = useProgramActions(refetch);

  // Redirection si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Logguer l'état pour le débogage
  useEffect(() => {
    console.log("Programs component state:", {
      isAuthenticated,
      userId: user?.id,
      programsCount: programs?.length,
      isLoading
    });
  }, [isAuthenticated, user, programs, isLoading]);

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement des programmes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <ProgramsHeader
        onCreateProgram={handleCreateProgram}
        onGenerateProgram={handleGenerateProgram}
      />

      <ProgramsList
        programs={programs}
        onDelete={(id) => {
          setProgramToDelete(id);
          setIsDeleteDialogOpen(true);
        }}
        onEdit={handleEditProgram}
        onDuplicate={(id) => handleDuplicateProgram(id, user?.id, programs)}
        onCreateProgram={handleCreateProgram}
        onGenerateProgram={handleGenerateProgram}
      />

      <DeleteProgramDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setProgramToDelete(null);
            refetch(); // Forcer le rafraîchissement des données lorsque le dialogue se ferme
          }
        }}
        onConfirm={handleDeleteProgram}
      />
    </div>
  );
}
