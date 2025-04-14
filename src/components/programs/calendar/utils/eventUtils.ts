
import { isSameDay } from "date-fns";
import { Event } from "../../types";

/**
 * Convert a time string (HH:MM) to minutes since midnight for sorting
 */
export const getTimeValue = (timeString: string | null | undefined): number => {
  if (!timeString) return Number.MAX_SAFE_INTEGER;
  
  const parts = timeString.split(':');
  if (parts.length === 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return hours * 60 + minutes;
  }
  return Number.MAX_SAFE_INTEGER;
};

/**
 * Filter events for a specific day and sort them by time
 */
export const getEventsForDay = (events: Event[], day: Date): Event[] => {
  if (!events || !Array.isArray(events)) return [];
  
  const filteredEvents = events.filter(event => {
    if (!event || !event.date) return false;
    
    try {
      const eventDate = event.date instanceof Date 
        ? event.date 
        : new Date(event.date);
        
      if (isNaN(eventDate.getTime())) {
        return false;
      }
        
      return isSameDay(day, eventDate);
    } catch (error) {
      console.error("Error comparing dates:", error);
      return false;
    }
  });
  
  // Sort the events by time
  return filteredEvents.sort((a, b) => {
    const timeA = getTimeValue(a.time);
    const timeB = getTimeValue(b.time);
    return timeA - timeB;
  });
};
