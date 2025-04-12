
import { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAthleteMutations } from "@/hooks/useAthleteMutations";
import { useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type AssignProgramDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAthlete: Profile | null;
};

export const AssignProgramDialog = ({
  isOpen,
  onOpenChange,
  selectedAthlete,
}: AssignProgramDialogProps) => {
  const { user } = useAuth();
  const { assignProgramMutation } = useAthleteMutations();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: availablePrograms, isLoading } = useQuery({
    queryKey: ["coach-programs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching programs:", error);
        toast.error("Erreur lors du chargement des programmes");
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id && isOpen,
  });

  // Filtrer les programmes par la recherche
  const filteredPrograms = availablePrograms?.filter(program => 
    program.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignProgram = (programId: string) => {
    if (!user?.id || !selectedAthlete?.id) return;
    
    assignProgramMutation.mutate(
      {
        coachId: user.id,
        athleteId: selectedAthlete.id,
        programId: programId,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Associer un programme</DialogTitle>
          <DialogDescription>
            Choisissez un programme à associer à {selectedAthlete?.first_name}{" "}
            {selectedAthlete?.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="relative my-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un programme..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="py-4 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredPrograms && filteredPrograms.length > 0 ? (
            <div className="grid gap-2">
              {filteredPrograms.map((program) => (
                <Button
                  key={program.id}
                  variant="outline"
                  className="justify-start h-auto py-3"
                  onClick={() => handleAssignProgram(program.id)}
                >
                  <div className="text-left">
                    <div className="font-medium">{program.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {program.duration} semaines • Créé le {new Date(program.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              {searchQuery 
                ? "Aucun programme ne correspond à votre recherche" 
                : "Aucun programme disponible. Créez-en un d'abord."
              }
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            variant="default"
            onClick={() => window.open("/coach/programs", "_blank")}
          >
            Créer un programme
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
