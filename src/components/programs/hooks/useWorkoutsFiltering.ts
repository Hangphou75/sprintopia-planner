
import { useState, useMemo } from "react";
import { Event } from "../types";

export const useWorkoutsFiltering = (events: Event[]) => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  
  const filteredWorkouts = useMemo(() => {
    let workouts = events.filter(event => event.type === "workout");
    
    if (selectedTheme) {
      workouts = workouts.filter(event => event.theme === selectedTheme);
    }
    
    return workouts.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [events, selectedTheme, sortOrder]);

  const handleSortOrderChange = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return {
    filteredWorkouts,
    selectedTheme,
    sortOrder,
    setSelectedTheme,
    handleSortOrderChange
  };
};
