
import { CalendarView } from "./CalendarView";
import { EventDetails } from "./EventDetails";
import { Event, ThemeOption } from "../types";

interface EventsDisplayProps {
  events: Event[];
  selectedDate: Date | null;
  themeOptions: ThemeOption[];
  onEventClick: (event: Event) => void;
  onEditClick: (event: Event) => void;
  readOnly: boolean;
  isMobile: boolean;
  onSelectDate: (date: Date) => void;
}

export const EventsDisplay = ({
  events,
  selectedDate,
  themeOptions,
  onEventClick,
  onEditClick,
  readOnly,
  isMobile,
  onSelectDate
}: EventsDisplayProps) => {
  return (
    <div className={`${isMobile ? 'flex flex-col space-y-6' : 'grid md:grid-cols-2 gap-4'}`}>
      {isMobile ? (
        <>
          <EventDetails 
            events={events} 
            selectedDate={selectedDate} 
            themeOptions={themeOptions} 
            onEventClick={onEventClick} 
            onEditClick={onEditClick} 
            readOnly={readOnly} 
          />
          <CalendarView 
            events={events} 
            selectedDate={selectedDate} 
            onSelectDate={onSelectDate} 
          />
        </>
      ) : (
        <>
          <CalendarView 
            events={events} 
            selectedDate={selectedDate} 
            onSelectDate={onSelectDate} 
          />
          <EventDetails 
            events={events} 
            selectedDate={selectedDate} 
            themeOptions={themeOptions} 
            onEventClick={onEventClick} 
            onEditClick={onEditClick} 
            readOnly={readOnly} 
          />
        </>
      )}
    </div>
  );
};
