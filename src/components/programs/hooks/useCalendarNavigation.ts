
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
    console.log("handleEventClick - Navigation with:", { event, userRole, programId });
    
    if (event.type === "workout") {
      // Admin users should navigate like coaches
      const isCoachOrAdmin = userRole === "coach" || userRole === "admin";
      
      if (isCoachOrAdmin) {
        console.log(`Navigating to workout details: /coach/programs/${programId}/workouts/${event.id}`);
        navigate(`/coach/programs/${programId}/workouts/${event.id}`);
      } else if (userRole === "individual_athlete") {
        console.log(`Navigating to individual athlete workout: /individual-athlete/programs/${programId}/workouts/${event.id}`);
        navigate(`/individual-athlete/programs/${programId}/workouts/${event.id}`);
      } else if (userRole === "athlete") {
        console.log(`Navigating to athlete workout: /athlete/programs/${programId}/workouts/${event.id}`);
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
      const isCoachOrAdmin = userRole === "coach" || userRole === "admin";
      
      if (isCoachOrAdmin) {
        console.log(`Navigating to: /coach/programs/${programId}/workouts/${event.id}/edit`);
        navigate(`/coach/programs/${programId}/workouts/${event.id}/edit`);
      } else if (userRole === "individual_athlete") {
        console.log(`Navigating to: /individual-athlete/programs/${programId}/workouts/${event.id}/edit`);
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
