
import { useAuth } from "@/contexts/AuthContext";
import { useAthletePrograms } from "@/hooks/useAthletePrograms";
import { DeleteProgramDialog } from "./components/DeleteProgramDialog";
import { ProgramsHeader } from "./components/ProgramsHeader";
import { ProgramsList } from "./components/ProgramsList";
import { useProgramActions } from "./hooks/useProgramActions";

export default function Programs() {
  const { user } = useAuth();
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
        onOpenChange={(open) => !open && setProgramToDelete(null)}
        onConfirm={handleDeleteProgram}
      />
    </div>
  );
}
