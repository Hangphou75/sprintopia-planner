import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Event } from "../types";

type UseCalendarNavigationProps = {
  programId: string;
  userRole?: string;
};

export const useCalendarNavigation = ({ programId, userRole }: UseCalendarNavigationProps) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleEventClick = (event: Event) => {
    if (event.type === "workout") {
      if (userRole === "coach") {
        navigate(`/coach/programs/${programId}/workouts/${event.id}/edit`);
      } else if (userRole === "individual_athlete") {
        navigate(`/individual-athlete/programs/${programId}/workouts/${event.id}`);
      } else if (userRole === "athlete") {
        navigate(`/athlete/programs/${programId}/workouts/${event.id}`);
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return {
    selectedDate,
    handleEventClick,
    handleDateSelect,
  };
};