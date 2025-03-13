
import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSubscriptionLimits = () => {
  const { user } = useAuth();

  const checkAthletesLimit = useCallback(async (): Promise<boolean> => {
    if (!user || user.role !== "coach") return true;
    
    // Si l'utilisateur est premium, pas de limite
    if (user.subscription_tier === "premium") return true;
    
    // Si max_athletes est null, pas de limite (cas improbable mais sécurité)
    if (user.max_athletes === null) return true;
    
    try {
      // Compter les athlètes actuels du coach
      const { count, error } = await supabase
        .from("coach_athletes")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", user.id);
        
      if (error) throw error;
      
      // Vérifier si l'utilisateur a atteint sa limite
      if (count !== null && count >= (user.max_athletes || 0)) {
        toast.error(
          user.subscription_tier === "free" 
            ? "Vous avez atteint la limite d'athlètes de votre compte gratuit. Passez à un forfait payant pour ajouter plus d'athlètes."
            : "Vous avez atteint la limite d'athlètes de votre abonnement Standard. Passez à Premium pour un nombre illimité d'athlètes."
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error checking athlete limits:", error);
      return false;
    }
  }, [user]);
  
  const getUsageStats = useCallback(async () => {
    if (!user || user.role !== "coach") return null;
    
    try {
      // Compter les athlètes actuels du coach
      const { count: athletesCount, error: athletesError } = await supabase
        .from("coach_athletes")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", user.id);
        
      if (athletesError) throw athletesError;
      
      // Compter les programmes actuels du coach
      const { count: programsCount, error: programsError } = await supabase
        .from("programs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
        
      if (programsError) throw programsError;
      
      return {
        athletesCount,
        athletesLimit: user.max_athletes,
        programsCount,
      };
    } catch (error) {
      console.error("Error getting usage stats:", error);
      return null;
    }
  }, [user]);

  return {
    checkAthletesLimit,
    getUsageStats,
    isSubscriptionExpired: user?.subscription_expiry 
      ? new Date(user.subscription_expiry) < new Date() 
      : false,
  };
};
