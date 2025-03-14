
import { useNavigate } from "react-router-dom";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { AthleteUsageBar } from "./athletes/AthleteUsageBar";
import { SubscriptionAlert } from "./athletes/SubscriptionAlert";
import { AthletesList } from "./athletes/AthletesList";
import { AthletePagination } from "./athletes/AthletePagination";
import { AthleteLoadingStates } from "./athletes/AthleteLoadingStates";
import { useAthleteManagement } from "./athletes/useAthleteManagement";

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

  const handleUpgradeClick = () => {
    navigate("/coach/profile");
  };

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
          <AthletesList athletes={athletes} isAdmin={isAdmin} />
          
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
