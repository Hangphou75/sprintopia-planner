
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAthleteInvitations = (coachId: string | undefined) => {
  const { data: invitations, isLoading, error } = useQuery({
    queryKey: ["athlete-invitations", coachId],
    queryFn: async () => {
      if (!coachId) return [];
      
      const { data, error } = await supabase
        .from("athlete_invitations")
        .select("*")
        .eq("coach_id", coachId)
        .eq("status", "pending");
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!coachId
  });

  return {
    invitations,
    isLoading,
    error,
    count: invitations?.length || 0
  };
};
