
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Ensures the date is valid, returning current date if not
 */
export const getValidDate = (date: Date | null | undefined): Date => {
  return date instanceof Date && !isNaN(date.getTime())
    ? date
    : new Date();
};

/**
 * Gets the start date of the week containing the given date
 */
export const getWeekStartDate = (currentDate: Date): Date => {
  const validCurrentDate = getValidDate(currentDate);
  return startOfWeek(validCurrentDate, { locale: fr });
};

/**
 * Gets array of dates representing a week from start date
 */
export const getWeekDays = (startDate: Date): Date[] => {
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
};

/**
 * Formats a date according to the given format
 */
export const formatDate = (date: Date, formatString: string): string => {
  return format(date, formatString, { locale: fr });
};

/**
 * Checks if a date is today
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};
