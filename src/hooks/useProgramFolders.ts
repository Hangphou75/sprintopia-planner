
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type Tables } from "@/types/database";

type ProgramFolder = Tables<'program_folders'>;

export const useProgramFolders = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: folders, isLoading } = useQuery({
    queryKey: ["program-folders", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_folders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at');

      if (error) throw error;
      return data as ProgramFolder[];
    },
    enabled: !!userId,
  });

  const createFolderMutation = useMutation({
    mutationFn: async ({ name, parentFolderId }: { name: string; parentFolderId?: string }) => {
      const { data, error } = await supabase
        .from('program_folders')
        .insert({
          name,
          user_id: userId,
          parent_folder_id: parentFolderId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-folders"] });
      toast.success("Dossier créé avec succès");
    },
    onError: (error) => {
      console.error("Error creating folder:", error);
      toast.error("Erreur lors de la création du dossier");
    },
  });

  const updateFolderMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from('program_folders')
        .update({ name })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-folders"] });
      toast.success("Dossier renommé avec succès");
    },
    onError: (error) => {
      console.error("Error updating folder:", error);
      toast.error("Erreur lors de la modification du dossier");
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('program_folders')
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-folders"] });
      toast.success("Dossier supprimé avec succès");
    },
    onError: (error) => {
      console.error("Error deleting folder:", error);
      toast.error("Erreur lors de la suppression du dossier");
    },
  });

  const moveProgramMutation = useMutation({
    mutationFn: async ({ programId, folderId }: { programId: string; folderId: string | null }) => {
      const { data: program, error } = await supabase
        .from("programs")
        .update({ folder_id: folderId })
        .eq("id", programId)
        .select()
        .single();

      if (error) throw error;
      return program;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Programme déplacé avec succès");
    },
    onError: (error) => {
      console.error("Error moving program:", error);
      toast.error("Erreur lors du déplacement du programme");
    },
  });

  return {
    folders,
    isLoading,
    createFolder: createFolderMutation.mutate,
    updateFolder: updateFolderMutation.mutate,
    deleteFolder: deleteFolderMutation.mutate,
    moveProgram: moveProgramMutation.mutate,
  };
};
