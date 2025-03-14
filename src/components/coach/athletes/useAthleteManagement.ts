
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAthleteManagement = (coachId: string | undefined) => {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const { user } = useAuth();
  const [usageInfo, setUsageInfo] = useState<{
    current: number;
    limit: number | null;
  } | null>(null);
  
  // Check if user is admin to handle different cases
  const isAdmin = user?.role === "admin";

  const { data, isLoading, error } = useQuery({
    queryKey: ["coach-athletes", coachId, page, isAdmin],
    queryFn: async () => {
      console.log("Fetching managed athletes for coach:", coachId, "isAdmin:", isAdmin);
      if (!coachId) return { athletes: [], count: 0 };

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Different query for admin vs. coach
      let queryBuilder;
      
      if (isAdmin) {
        // Admin can see all coach-athlete relationships
        console.log("Fetching athletes with admin privileges");
        queryBuilder = supabase
          .from("coach_athletes")
          .select(`
            id,
            coach_id,
            athlete:profiles!coach_athletes_athlete_id_fkey (
              id,
              first_name,
              last_name,
              email
            )
          `)
          .range(from, to);
      } else {
        // Regular coach only sees their athletes
        queryBuilder = supabase
          .from("coach_athletes")
          .select(`
            id,
            coach_id,
            athlete:profiles!coach_athletes_athlete_id_fkey (
              id,
              first_name,
              last_name,
              email
            )
          `)
          .eq("coach_id", coachId)
          .range(from, to);
      }

      const { data: athletes, error: athletesError } = await queryBuilder;

      if (athletesError) {
        console.error("Error fetching athletes:", athletesError);
        throw athletesError;
      }

      console.log("Fetched athletes:", athletes);

      // Count query needs to match the filter used above
      let countQueryBuilder;
      
      if (isAdmin) {
        countQueryBuilder = supabase
          .from("coach_athletes")
          .select("*", { count: "exact", head: true });
      } else {
        countQueryBuilder = supabase
          .from("coach_athletes")
          .select("*", { count: "exact", head: true })
          .eq("coach_id", coachId);
      }

      const { count, error: countError } = await countQueryBuilder;

      if (countError) {
        console.error("Error counting athletes:", countError);
        throw countError;
      }
      
      console.log("Managed athletes fetched:", athletes, "count:", count);
      
      // Update usage information
      if (count !== null && user?.max_athletes !== undefined) {
        setUsageInfo({
          current: count,
          limit: isAdmin ? null : user.max_athletes // Admins have no limit
        });
      }
      
      return { athletes, count };
    },
    enabled: !!coachId,
  });

  const totalPages = Math.ceil((data?.count || 0) / pageSize);

  return {
    athletes: data?.athletes,
    count: data?.count,
    page,
    setPage,
    totalPages,
    isLoading,
    error,
    isAdmin,
    usageInfo
  };
};
