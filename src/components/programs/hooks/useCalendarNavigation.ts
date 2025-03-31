
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Event } from "../types";

type UseCalendarNavigationProps = {
  programId: string;
  userRole?: string;
};

export const useCalendarNavigation = ({ programId, userRole }: UseCalendarNavigationProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const navigate = useNavigate();

  const handleEventClick = (event: Event) => {
    if (event.type === "workout") {
      if (userRole === "coach" || userRole === "admin") {
        navigate(`/coach/programs/${programId}/workouts/${event.id}`);
      } else if (userRole === "individual_athlete") {
        navigate(`/individual-athlete/programs/${programId}/workouts/${event.id}`);
      } else if (userRole === "athlete") {
        navigate(`/athlete/programs/${programId}/workouts/${event.id}`);
      }
    } else if (event.type === "competition") {
      // Navigate to competition details page
      console.log("Navigate to competition details", event);
    }
  };

  const handleEditWorkout = (event: Event) => {
    console.log("Editing workout", event);
    
    if (event.type === "workout") {
      // Permettre aux admins d'éditer les séances comme les coachs
      if (userRole === "coach" || userRole === "admin") {
        navigate(`/coach/programs/${programId}/workouts/${event.id}/edit`);
      } else if (userRole === "individual_athlete") {
        navigate(`/individual-athlete/programs/${programId}/workouts/${event.id}/edit`);
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return {
    selectedDate,
    handleEventClick,
    handleEditWorkout,
    handleDateSelect
  };
};
