
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AthletePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const AthletePagination = ({ 
  page, 
  totalPages, 
  onPageChange 
}: AthletePaginationProps) => {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} sur {totalPages || 1}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages || totalPages === 0}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
