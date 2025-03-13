
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { usePrograms } from "./hooks/usePrograms";
import { useProgramOperations } from "./hooks/useProgramOperations";
import { ShareProgramDialog } from "./components/ShareProgramDialog";
import { DeleteProgramDialog } from "./components/DeleteProgramDialog";
import { toast } from "sonner";

const Programs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  const { data: programs, isLoading, error } = usePrograms();
  const { deleteMutation, duplicateMutation } = useProgramOperations();

  // Log data for debugging
  console.log("Programs page - user:", user);
  console.log("Programs page - fetched programs:", programs);
  
  if (error) {
    console.error("Error in Programs component:", error);
    toast.error("Erreur lors du chargement des programmes");
  }

  const handleDelete = (programId: string) => {
    setSelectedProgramId(programId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProgramId) {
      deleteMutation.mutate(selectedProgramId);
      setIsDeleteDialogOpen(false);
    }
  };

  const onShareProgram = (programId: string) => {
    console.log("Opening share dialog for program:", programId);
    setSelectedProgramId(programId);
    setIsShareDialogOpen(true);
  };

  const handleEdit = (programId: string) => {
    console.log("Navigating to edit program:", programId);
    navigate(`/coach/programs/${programId}/edit`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des programmes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes programmes</h1>
        <Button onClick={() => navigate("/coach/programs/new")}>
          Nouveau programme
        </Button>
      </div>

      <ScrollArea className="flex-1 px-1">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {!programs || programs.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-8">
              Aucun programme créé
            </p>
          ) : (
            programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onShare={onShareProgram}
                onDelete={handleDelete}
                onDuplicate={(id) => duplicateMutation.mutate(id)}
                onEdit={handleEdit}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <ShareProgramDialog
        isOpen={isShareDialogOpen}
        onOpenChange={(open) => {
          setIsShareDialogOpen(open);
          if (!open) setSelectedProgramId(null);
        }}
        programId={selectedProgramId}
      />

      <DeleteProgramDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Programs;
