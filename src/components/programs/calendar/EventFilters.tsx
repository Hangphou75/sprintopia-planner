import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { ThemeOption } from "../types";

type EventFiltersProps = {
  selectedTheme: string | null;
  sortOrder: "asc" | "desc";
  themeOptions: ThemeOption[];
  onThemeChange: (theme: string | null) => void;
  onSortOrderChange: () => void;
};

export const EventFilters = ({
  selectedTheme,
  sortOrder,
  themeOptions,
  onThemeChange,
  onSortOrderChange,
}: EventFiltersProps) => {
  return (
    <div className="flex items-center gap-2">
      <Select value={selectedTheme || "all"} onValueChange={(value) => onThemeChange(value === "all" ? null : value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Type de séance" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les types</SelectItem>
          {themeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={onSortOrderChange}
        title={sortOrder === "asc" ? "Tri croissant" : "Tri décroissant"}
      >
        {sortOrder === "asc" ? (
          <ArrowUpAZ className="h-4 w-4" />
        ) : (
          <ArrowDownAZ className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};