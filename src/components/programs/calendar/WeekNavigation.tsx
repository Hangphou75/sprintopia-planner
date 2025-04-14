
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekNavigationProps {
  startDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  isProcessing: boolean;
  dateLabel: string;
}

export const WeekNavigation = ({
  startDate,
  onPrevWeek,
  onNextWeek,
  isProcessing,
  dateLabel
}: WeekNavigationProps) => {
  return (
    <div className="flex justify-between items-center">
      <Button variant="outline" size="icon" onClick={onPrevWeek} disabled={isProcessing}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h3 className="font-semibold text-sm text-center">
        {dateLabel}
      </h3>
      <Button variant="outline" size="icon" onClick={onNextWeek} disabled={isProcessing}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
