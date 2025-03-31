
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { usePrograms } from "./hooks/usePrograms";
import { useProgramFolders } from "@/hooks/useProgramFolders";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Plus, Folder, ChevronRight, MoreVertical, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const CoachPlanning = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");

  const { folders, createFolder, updateFolder, deleteFolder, moveProgram } = useProgramFolders(user?.id);

  const { 
    data: programs, 
    isLoading, 
    error, 
    refetch,
    isRefetching
  } = usePrograms();

  useEffect(() => {
    if (error) {
      console.error("Error loading programs:", error);
      toast.error("Erreur lors du chargement des programmes");
    }
  }, [error]);

  const handleDeleteProgram = async (programId: string) => {
    try {
      const { error } = await supabase
        .from("programs")
        .delete()
        .eq("id", programId);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Programme supprimé avec succès");
    } catch (err) {
      console.error("Error deleting program:", err);
      toast.error("Erreur lors de la suppression du programme");
    }
  };

  const handleDuplicateProgram = async (programId: string) => {
    try {
      toast.info("Duplication du programme en cours...");
      
      // Fetch the program to duplicate
      const { data: program, error: fetchError } = await supabase
        .from("programs")
        .select("*")
        .eq("id", programId)
        .single();

      if (fetchError) throw fetchError;

      // Create new program with the current user as owner
      const { data: newProgram, error: createError } = await supabase
        .from("programs")
        .insert({
          name: `${program.name} (copie)`,
          duration: program.duration,
          objectives: program.objectives,
          start_date: program.start_date,
          user_id: user?.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Programme dupliqué avec succès");
    } catch (err) {
      console.error("Error duplicating program:", err);
      toast.error("Erreur lors de la duplication du programme");
    }
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    createFolder(
      { name: newFolderName, parentFolderId: currentFolderId },
      {
        onSuccess: () => {
          setNewFolderName("");
          setIsCreateFolderOpen(false);
        },
      }
    );
  };

  const handleRenameFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameFolderName.trim() || !renameFolderId) return;

    updateFolder(
      { id: renameFolderId, name: renameFolderName },
      {
        onSuccess: () => {
          setRenameFolderId(null);
          setRenameFolderName("");
        },
      }
    );
  };

  const getCurrentPath = () => {
    if (!currentFolderId || !folders) return [];
    const path = [];
    let current = folders.find(f => f.id === currentFolderId);
    while (current) {
      path.unshift(current);
      current = folders.find(f => f.id === current?.parent_folder_id);
    }
    return path;
  };

  const filteredPrograms = programs?.filter(program => {
    if (currentFolderId === null) {
      return program.folder_id === null;
    }
    return program.folder_id === currentFolderId;
  });

  useEffect(() => {
    console.log("Folders:", folders);
    console.log("Current folder ID:", currentFolderId);
    console.log("Programs:", programs);
    console.log("Filtered programs:", filteredPrograms);
  }, [folders, currentFolderId, programs, filteredPrograms]);

  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["programs"] });
    queryClient.invalidateQueries({ queryKey: ["program-folders"] });
    refetch();
    toast.info("Rafraîchissement des données...");
  };

  const renderLoadingState = () => {
    return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-2">
          <h1 className="text-3xl font-bold">Mes programmes</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsCreateFolderOpen(true)}
          >
            <Folder className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefreshData}
            disabled={isRefetching}
          >
            <RefreshCcw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <Button 
          onClick={() => navigate("/coach/programs/new")}
          size={isMobile ? "icon" : "default"}
        >
          <Plus className="h-4 w-4" />
          {!isMobile && "Nouveau programme"}
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Button
          variant="ghost"
          className="h-8"
          onClick={() => setCurrentFolderId(null)}
        >
          Tous les programmes
        </Button>
        {getCurrentPath().map((folder, index) => (
          <div key={folder.id} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            <Button
              variant="ghost"
              className="h-8"
              onClick={() => setCurrentFolderId(folder.id)}
            >
              {folder.name}
            </Button>
          </div>
        ))}
      </div>

      <ScrollArea className="flex-1 px-1">
        {isLoading ? renderLoadingState() : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {folders
              ?.filter((f) => f.parent_folder_id === currentFolderId)
              .map((folder) => (
                <div
                  key={folder.id}
                  className="border rounded-lg p-4 flex items-center justify-between hover:bg-accent cursor-pointer"
                  onClick={() => setCurrentFolderId(folder.id)}
                >
                  <div className="flex items-center space-x-2">
                    <Folder className="h-5 w-5" />
                    <span>{folder.name}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameFolderId(folder.id);
                          setRenameFolderName(folder.name);
                        }}
                      >
                        Renommer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Êtes-vous sûr de vouloir supprimer ce dossier ?")) {
                            deleteFolder(folder.id);
                          }
                        }}
                      >
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}

            {filteredPrograms?.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onDelete={handleDeleteProgram}
                onDuplicate={handleDuplicateProgram}
                folders={folders || []}
                onMove={(folderId) => moveProgram({ programId: program.id, folderId })}
              />
            ))}

            {(!filteredPrograms || filteredPrograms.length === 0) && 
             (!folders?.filter((f) => f.parent_folder_id === currentFolderId).length) && (
              <p className="text-muted-foreground col-span-full text-center py-8">
                Aucun programme ou dossier
              </p>
            )}
          </div>
        )}
      </ScrollArea>

      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau dossier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFolder}>
            <div className="space-y-4">
              <Input
                placeholder="Nom du dossier"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">Créer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!renameFolderId} onOpenChange={() => setRenameFolderId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renommer le dossier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRenameFolder}>
            <div className="space-y-4">
              <Input
                placeholder="Nouveau nom"
                value={renameFolderName}
                onChange={(e) => setRenameFolderName(e.target.value)}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">Renommer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoachPlanning;
