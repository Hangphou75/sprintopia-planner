
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Program } from "@/types/program";
import { ProgramFolder } from "@/types/folder";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Copy, Folder, MoreVertical, Trash2, Share, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ProgramCardProps = {
  program: Program;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onShare?: (id: string) => void;
  onEdit?: (id: string) => void;
  folders?: ProgramFolder[];
  onMove?: (folderId: string | null) => void;
};

export const ProgramCard = ({ 
  program, 
  onDelete, 
  onDuplicate, 
  onShare, 
  onEdit,
  folders = [], 
  onMove 
}: ProgramCardProps) => {
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce programme ?")) {
      onDelete(program.id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate(program.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) onShare(program.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(program.id);
  };

  return (
    <Card className="cursor-pointer hover:bg-accent/5" onClick={() => navigate(`/coach/programs/${program.id}/workouts`)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{program.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {onEdit && (
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Dupliquer
              </DropdownMenuItem>
              {onShare && (
                <DropdownMenuItem onClick={handleShare}>
                  <Share className="h-4 w-4 mr-2" />
                  Partager
                </DropdownMenuItem>
              )}
              {onMove && (
                <>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onMove(null);
                  }}>
                    <Folder className="h-4 w-4 mr-2" />
                    Déplacer vers la racine
                  </DropdownMenuItem>
                  {folders.map((folder) => (
                    <DropdownMenuItem
                      key={folder.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(folder.id);
                      }}
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      Déplacer vers {folder.name}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-1">
        <p>Durée : {program.duration} semaines</p>
        <p>Début : {format(new Date(program.start_date), "dd MMMM yyyy", { locale: fr })}</p>
        {program.objectives && <p>Objectifs : {program.objectives}</p>}
      </CardContent>
      {program.shared_programs && program.shared_programs.length > 0 && (
        <CardFooter className="text-xs text-muted-foreground pt-2">
          Partagé avec {program.shared_programs.length} athlète
          {program.shared_programs.length > 1 ? "s" : ""}
        </CardFooter>
      )}
    </Card>
  );
};
