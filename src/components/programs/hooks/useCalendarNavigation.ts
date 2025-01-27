import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Event } from "../types";
import { useToast } from "@/hooks/use-toast";

type UseCalendarNavigationProps = {
  programId: string;
  userRole?: string;
};

export const useCalendarNavigation = ({ programId, userRole }: UseCalendarNavigationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessingClick, setIsProcessingClick] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const handleEventClick = useCallback((event: Event) => {
    if (isProcessingClick || event.type !== "workout") return;
    
    setIsProcessingClick(true);
    
    try {
      if (userRole === 'athlete') {
        navigate(`/athlete/programs/${programId}/workouts/${event.id}`);
      } else {
        navigate(`/coach/programs/${programId}/workouts/${event.id}/edit`);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la navigation.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsProcessingClick(false);
      }, 500);
    }
  }, [navigate, programId, userRole, isProcessingClick, toast]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (!isProcessingClick) {
      setSelectedDate(date);
    }
  }, [isProcessingClick]);

  return {
    selectedDate,
    isProcessingClick,
    handleEventClick,
    handleDateSelect,
  };
};