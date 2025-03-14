
import { useEffect } from "react";

type UsageInfo = {
  current: number;
  limit: number | null;
};

interface AthleteUsageBarProps {
  usageInfo: UsageInfo | null;
}

export const AthleteUsageBar = ({ usageInfo }: AthleteUsageBarProps) => {
  if (!usageInfo || usageInfo.limit === null) return null;
  
  const percentage = (usageInfo.current / usageInfo.limit) * 100;
  const isNearLimit = percentage >= 80;
  
  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between text-xs">
        <span>{usageInfo.current} / {usageInfo.limit} athlètes</span>
        {isNearLimit && (
          <span className="text-amber-600 font-medium">Limite proche</span>
        )}
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${isNearLimit ? 'bg-amber-500' : 'bg-green-500'}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};
