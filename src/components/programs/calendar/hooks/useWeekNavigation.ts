
import { useState, useCallback, useRef, useEffect } from "react";
import { addDays } from "date-fns";
import { toast } from "sonner";
import { Event } from "../../types";

interface UseWeekNavigationProps {
  onDateChange: (date: Date) => void;
  onEventClick?: (event: Event) => void;
}

export const useWeekNavigation = ({ onDateChange, onEventClick }: UseWeekNavigationProps) => {
  // Protection contre les clics trop fréquents
  const [isProcessing, setIsProcessing] = useState(false);
  const lastClickTime = useRef(0);

  // Nettoyage à la déconnexion du composant
  useEffect(() => {
    return () => {
      setIsProcessing(false);
    };
  }, []);

  const prevWeek = useCallback((startDate: Date) => {
    const now = Date.now();
    if (isProcessing || (now - lastClickTime.current < 500)) {
      console.log("Ignoring fast click in WeekView navigation");
      return;
    }
    
    lastClickTime.current = now;
    setIsProcessing(true);
    
    try {
      onDateChange(addDays(startDate, -7));
    } catch (error) {
      console.error("Error in prevWeek:", error);
      toast.error("Erreur de navigation");
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  }, [onDateChange, isProcessing]);
  
  const nextWeek = useCallback((startDate: Date) => {
    const now = Date.now();
    if (isProcessing || (now - lastClickTime.current < 500)) {
      console.log("Ignoring fast click in WeekView navigation");
      return;
    }
    
    lastClickTime.current = now;
    setIsProcessing(true);
    
    try {
      onDateChange(addDays(startDate, 7));
    } catch (error) {
      console.error("Error in nextWeek:", error);
      toast.error("Erreur de navigation");
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  }, [onDateChange, isProcessing]);

  // Protection contre les clics rapides pour les événements
  const handleEventClick = useCallback((event: Event) => {
    const now = Date.now();
    if (isProcessing || (now - lastClickTime.current < 500) || !onEventClick) {
      console.log("Ignoring fast click on event");
      return;
    }
    
    lastClickTime.current = now;
    setIsProcessing(true);
    
    try {
      if (!event || !event.id) {
        console.error("Invalid event in handleEventClick:", event);
        return;
      }
      
      onEventClick(event);
    } catch (error) {
      console.error("Error in onEventClick:", error);
      toast.error("Erreur lors de la sélection d'un événement");
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  }, [onEventClick, isProcessing]);

  return {
    isProcessing,
    prevWeek,
    nextWeek,
    handleEventClick
  };
};
