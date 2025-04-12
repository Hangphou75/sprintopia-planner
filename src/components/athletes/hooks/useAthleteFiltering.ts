
import { useState, useMemo, useEffect } from "react";
import { Profile } from "@/types/database";

export const useAthleteFiltering = (athletesData: any[] | undefined) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);

  // Ensure we have a valid data array to work with
  const athletes = useMemo(() => athletesData || [], [athletesData]);

  // Extract unique coaches for admin filtering
  const coaches = useMemo(() => {
    if (!athletes?.length) return [];

    const uniqueCoaches = new Map();
    
    athletes.forEach(relation => {
      if (relation.coach && !uniqueCoaches.has(relation.coach.id)) {
        uniqueCoaches.set(relation.coach.id, {
          id: relation.coach.id,
          name: `${relation.coach.first_name || ''} ${relation.coach.last_name || ''}`.trim() || relation.coach.email,
        });
      }
    });
    
    return Array.from(uniqueCoaches.values());
  }, [athletes]);

  // Filter athletes based on search query and selected coach
  const filteredAthletes = useMemo(() => {
    if (!athletes?.length) return [];
    
    return athletes.filter(relation => {
      const athlete = relation.athlete;
      const coach = relation.coach;
      
      // Skip if no athlete data
      if (!athlete) return false;
      
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const fullName = `${athlete.first_name || ''} ${athlete.last_name || ''}`.toLowerCase();
      const email = (athlete.email || '').toLowerCase();
      
      const matchesSearch = !searchQuery || 
        fullName.includes(searchLower) || 
        email.includes(searchLower);
      
      // Coach filter (for admin view)
      const matchesCoach = !selectedCoach || relation.coach_id === selectedCoach;
      
      return matchesSearch && matchesCoach;
    });
  }, [athletes, searchQuery, selectedCoach]);

  // Sort athletes by the chosen sort method
  const sortedAthletes = useMemo(() => {
    if (!filteredAthletes.length) return [];
    
    return [...filteredAthletes].sort((a, b) => {
      const athleteA = a.athlete;
      const athleteB = b.athlete;
      
      switch (sortBy) {
        case "name":
          const nameA = `${athleteA.last_name || ''} ${athleteA.first_name || ''}`.toLowerCase();
          const nameB = `${athleteB.last_name || ''} ${athleteB.first_name || ''}`.toLowerCase();
          return nameA.localeCompare(nameB);
          
        case "email":
          return (athleteA.email || '').localeCompare(athleteB.email || '');
          
        case "date":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          
        default:
          return 0;
      }
    });
  }, [filteredAthletes, sortBy]);

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedCoach,
    setSelectedCoach,
    coaches,
    sortedAthletes
  };
};
