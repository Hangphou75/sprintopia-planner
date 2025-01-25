import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeOption } from "../types";

type EventFiltersProps = {
  selectedTheme: string | null;
  sortOrder: "asc" | "desc";
  themeOptions: ThemeOption[];
  onThemeChange: (theme: string) => void;
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
    <div className="flex gap-2">
      <Select value={selectedTheme || ""} onValueChange={onThemeChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Type de séance" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tous les types</SelectItem>
          {themeOptions.map((theme) => (
            <SelectItem key={theme.value} value={theme.value}>
              {theme.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={onSortOrderChange}>
        {sortOrder === "asc" ? (
          <ArrowUp className="h-4 w-4 mr-2" />
        ) : (
          <ArrowDown className="h-4 w-4 mr-2" />
        )}
        Date
      </Button>
    </div>
  );
};