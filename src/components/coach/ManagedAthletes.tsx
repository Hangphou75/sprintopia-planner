
import { useNavigate } from "react-router-dom";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { AthleteUsageBar } from "./athletes/AthleteUsageBar";
import { SubscriptionAlert } from "./athletes/SubscriptionAlert";
import { AthletesList } from "./athletes/AthletesList";
import { AthletePagination } from "./athletes/AthletePagination";
import { AthleteLoadingStates } from "./athletes/AthleteLoadingStates";
import { useAthleteManagement } from "./athletes/useAthleteManagement";
import { useCallback, useMemo } from "react";

type ManagedAthletesProps = {
  coachId: string | undefined;
};

export const ManagedAthletes = ({ coachId }: ManagedAthletesProps) => {
  const navigate = useNavigate();
  const { isSubscriptionExpired } = useSubscriptionLimits();
  
  const {
    athletes,
    page,
    setPage,
    totalPages,
    isLoading,
    error,
    isAdmin,
    usageInfo
  } = useAthleteManagement(coachId);

  const handleUpgradeClick = useCallback(() => {
    navigate("/coach/profile");
  }, [navigate]);

  // Memoize athletes to prevent unnecessary re-renders of AthletesList
  const memoizedAthletes = useMemo(() => athletes, [athletes]);

  return (
    <div className="space-y-4">
      <SubscriptionAlert 
        isSubscriptionExpired={isSubscriptionExpired} 
        isAdmin={isAdmin} 
        onUpgrade={handleUpgradeClick} 
      />
      
      {usageInfo && <AthleteUsageBar usageInfo={usageInfo} />}
      
      <AthleteLoadingStates isLoading={isLoading} error={error} />

      {!isLoading && !error && (
        <>
          <AthletesList athletes={memoizedAthletes} isAdmin={isAdmin} />
          
          {athletes && athletes.length > 0 && (
            <AthletePagination 
              page={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
            />
          )}
        </>
      )}
    </div>
  );
};
