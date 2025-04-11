
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';

interface DateSelectorProps {
  date: Date;
  setDate: (date: Date) => void;
}

export const DateSelector = ({ date, setDate }: DateSelectorProps) => {
  return (
    <div className="flex justify-end">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            {format(date, 'dd/MM/yyyy')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => date && setDate(date)}
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
