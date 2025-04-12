
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

export const useCalendarDateSelection = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Éviter les clics multiples successifs
  const [isProcessingClick, setIsProcessingClick] = useState(false);
  // Suivi du dernier clic pour éviter les doubles clics
  const lastClickTime = useRef(0);
  // Dernière date sélectionnée pour éviter la double sélection de la même date
  const lastSelectedDateRef = useRef<Date | null>(null);

  // Sélection de date avec protection anti-double-clic
  const handleDateSelect = useCallback((date: Date | undefined) => {
    // Protection contre les clics trop rapides
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;
    
    if (isProcessingClick || timeSinceLastClick < 800) {
      console.log("Ignoring click, too soon or already processing");
      return;
    }
    
    // Protection contre les doubles clics sur la même date
    if (date && lastSelectedDateRef.current && 
        date.toDateString() === lastSelectedDateRef.current.toDateString()) {
      console.log("Ignoring repeated click on same date");
      return;
    }
    
    lastClickTime.current = now;
    setIsProcessingClick(true);
    console.log("Selected date:", date);
    
    try {
      // Vérifier si la date est valide
      if (date && date instanceof Date && !isNaN(date.getTime())) {
        lastSelectedDateRef.current = date;
        setSelectedDate(date);
        
        // Délai pour ouvrir la feuille pour éviter les problèmes de rendu
        setTimeout(() => {
          setIsDetailsOpen(true);
        }, 50);
      } else {
        console.error("Invalid date selected:", date);
        setSelectedDate(new Date());
        toast.error("Date invalide sélectionnée");
      }
    } catch (error) {
      console.error("Error in date selection:", error);
      // En cas d'erreur, revenir à aujourd'hui
      setSelectedDate(new Date());
      toast.error("Erreur lors de la sélection de date");
    } finally {
      // Réinitialiser l'état de traitement après un délai
      setTimeout(() => {
        setIsProcessingClick(false);
      }, 800);
    }
  }, [isProcessingClick]);

  // Gestion de l'ouverture/fermeture de la feuille
  const handleSheetOpenChange = useCallback((open: boolean) => {
    // Protection contre les appels trop rapides
    if (isProcessingClick) {
      console.log("Ignoring sheet open change, still processing click");
      return;
    }
    
    console.log("Setting sheet open state to:", open);
    try {
      setIsDetailsOpen(open);
    } catch (error) {
      console.error("Error changing sheet open state:", error);
      // Forcer la réinitialisation en cas d'erreur
      setIsDetailsOpen(false);
    }
  }, [isProcessingClick]);

  return {
    selectedDate,
    isDetailsOpen,
    isProcessingClick,
    handleDateSelect,
    handleSheetOpenChange
  };
};
