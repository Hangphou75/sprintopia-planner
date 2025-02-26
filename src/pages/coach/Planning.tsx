
import { Plus, Folder, ChevronRight, MoreVertical } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Program } from "@/types/program";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProgramFolders } from "@/hooks/useProgramFolders";
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
import { useState } from "react";

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

  const { data: programs, isLoading } = useQuery({
    queryKey: ["programs", currentFolderId],
    queryFn: async () => {
      console.log("Fetching programs for user:", user?.id);
      const { data, error } = await supabase
        .from("programs")
        .select(`
          *,
          competitions(*),
          shared_programs(
            athlete:profiles!shared_programs_athlete_id_fkey(
              id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq("user_id", user?.id)
        .eq("folder_id", currentFolderId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to match the Program type
      const transformedData: Program[] = (data || []).map(program => ({
        ...program,
        id: program.id,
        name: program.name,
        duration: program.duration,
        objectives: program.objectives,
        start_date: program.start_date,
        created_at: program.created_at,
        updated_at: program.updated_at,
        user_id: program.user_id,
        training_phase: program.training_phase,
        phase_duration: program.phase_duration,
        main_distance: program.main_distance,
        main_competition: program.main_competition ? {
          name: (program.main_competition as any).name || '',
          date: (program.main_competition as any).date || '',
          location: (program.main_competition as any).location || '',
        } : null,
        intermediate_competitions: program.intermediate_competitions ? 
          (program.intermediate_competitions as any[]).map((comp: any) => ({
            name: comp.name || '',
            date: comp.date || '',
            location: comp.location || '',
          })) : null,
        generated: program.generated,
        shared_programs: program.shared_programs
      }));

      console.log("Programs fetched:", transformedData);
      return transformedData;
    },
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (programId: string) => {
      const { error } = await supabase
        .from("programs")
        .delete()
        .eq("id", programId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Programme supprimé avec succès");
    },
    onError: (error) => {
      console.error("Error deleting program:", error);
      toast.error("Erreur lors de la suppression du programme");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (programId: string) => {
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

      // Duplicate competitions
      const { data: competitions, error: compFetchError } = await supabase
        .from("competitions")
        .select("*")
        .eq("program_id", programId);

      if (compFetchError) throw compFetchError;

      if (competitions && competitions.length > 0) {
        const { error: compCreateError } = await supabase
          .from("competitions")
          .insert(
            competitions.map((comp) => ({
              ...comp,
              id: undefined,
              program_id: newProgram.id,
            }))
          );

        if (compCreateError) throw compCreateError;
      }

      // Duplicate workouts
      const { data: workouts, error: workoutFetchError } = await supabase
        .from("workouts")
        .select("*")
        .eq("program_id", programId);

      if (workoutFetchError) throw workoutFetchError;

      if (workouts && workouts.length > 0) {
        const { error: workoutCreateError } = await supabase
          .from("workouts")
          .insert(
            workouts.map((workout) => ({
              ...workout,
              id: undefined,
              program_id: newProgram.id,
            }))
          );

        if (workoutCreateError) throw workoutCreateError;
      }

      return newProgram;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Programme dupliqué avec succès");
    },
    onError: (error) => {
      console.error("Error duplicating program:", error);
      toast.error("Erreur lors de la duplication du programme");
    },
  });

  const handleDeleteProgram = (programId: string) => {
    deleteMutation.mutate(programId);
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
          Racine
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
                    <Button variant="ghost" size="icon">
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

          {programs?.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onDelete={handleDeleteProgram}
              onDuplicate={(id) => duplicateMutation.mutate(id)}
              folders={folders || []}
              onMove={(folderId) => moveProgram({ programId: program.id, folderId })}
            />
          ))}

          {!programs?.length && !folders?.filter((f) => f.parent_folder_id === currentFolderId).length && (
            <p className="text-muted-foreground col-span-full text-center py-8">
              Aucun programme ou dossier
            </p>
          )}
        </div>
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
