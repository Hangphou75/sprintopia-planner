
import { useState } from "react";
import { AthleteAdminFilters } from "@/components/athletes/AthleteAdminFilters";

type CoachInfo = {
  id: string;
  name: string;
};

interface AthleteAdminPanelProps {
  coaches: CoachInfo[];
  totalAthletes: number;
  selectedCoach: string | null;
  onCoachChange: (coachId: string | null) => void;
}

export const AthleteAdminPanel = ({
  coaches,
  totalAthletes,
  selectedCoach,
  onCoachChange
}: AthleteAdminPanelProps) => {
  return (
    <AthleteAdminFilters
      totalAthletes={totalAthletes}
      coaches={coaches}
      selectedCoach={selectedCoach}
      onCoachChange={onCoachChange}
    />
  );
};
