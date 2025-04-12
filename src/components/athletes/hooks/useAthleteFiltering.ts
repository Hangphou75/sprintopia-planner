
import { useState, useMemo } from "react";
import { Profile } from "@/types/database";

type AthleteRelation = {
  id: string;
  athlete: Profile;
  coach_id: string;
  coach?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
};

export const useAthleteFiltering = (athletesData: AthleteRelation[] | undefined) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  
  // Get unique coaches from the data (for admin filtering)
  const coaches = useMemo(() => {
    if (!athletesData) return [];
    
    return Array.from(new Set(athletesData.map(a => a.coach_id)))
      .map(coachId => {
        const coachRelation = athletesData.find(a => a.coach_id === coachId);
        if (coachRelation?.coach) {
          return {
            id: coachId,
            name: `${coachRelation.coach.first_name} ${coachRelation.coach.last_name}`
          };
        }
        return null;
      })
      .filter((coach): coach is {id: string; name: string} => coach !== null);
  }, [athletesData]);

  // Filter athletes based on search and coach selection
  const filteredAthletes = useMemo(() => {
    return athletesData?.filter(relation => {
      const athlete = relation.athlete;
      // First filter by search text
      const matchesSearch = 
        `${athlete.first_name} ${athlete.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
        athlete.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Then filter by selected coach (admin only)
      const matchesCoach = !selectedCoach || relation.coach_id === selectedCoach;
      
      return matchesSearch && matchesCoach;
    });
  }, [athletesData, searchQuery, selectedCoach]);

  // Sort filtered athletes
  const sortedAthletes = useMemo(() => {
    return [...(filteredAthletes || [])].sort((a, b) => {
      const athleteA = a.athlete;
      const athleteB = b.athlete;
  
      switch (sortBy) {
        case "name":
          return `${athleteA.first_name} ${athleteA.last_name}`.localeCompare(
            `${athleteB.first_name} ${athleteB.last_name}`
          );
        case "email":
          return (athleteA.email || "").localeCompare(athleteB.email || "");
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
