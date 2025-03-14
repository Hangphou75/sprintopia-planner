
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo, useCallback } from "react";

interface AthletePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const AthletePagination = memo(({ 
  page, 
  totalPages, 
  onPageChange 
}: AthletePaginationProps) => {
  const handlePrevPage = useCallback(() => {
    onPageChange(Math.max(1, page - 1));
  }, [page, onPageChange]);

  const handleNextPage = useCallback(() => {
    onPageChange(Math.min(totalPages, page + 1));
  }, [page, totalPages, onPageChange]);

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevPage}
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
        onClick={handleNextPage}
        disabled={page === totalPages || totalPages === 0}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
});

AthletePagination.displayName = "AthletePagination";
