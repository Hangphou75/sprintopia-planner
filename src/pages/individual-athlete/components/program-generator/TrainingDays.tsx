
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../../types/programTypes";

interface TrainingDaysProps {
  form: UseFormReturn<FormValues>;
  DAYS_OF_WEEK: Array<{ value: string; label: string; }>;
}

export const TrainingDays = ({ form, DAYS_OF_WEEK }: TrainingDaysProps) => {
  const selectedTrainingDays = form.watch("trainingDays");

  const handleValueChange = (values: string[]) => {
    // Limiter à 5 jours maximum
    if (values.length <= 5) {
      form.setValue("trainingDays", values);
    }
  };

  return (
    <FormField
      control={form.control}
      name="trainingDays"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Jours d'entraînement ({selectedTrainingDays.length}/5 séances maximum)
          </FormLabel>
          <FormControl>
            <ToggleGroup
              type="multiple"
              value={field.value}
              onValueChange={handleValueChange}
              className="flex flex-wrap gap-2"
            >
              {DAYS_OF_WEEK.map((day) => (
                <ToggleGroupItem
                  key={day.value}
                  value={day.value}
                  aria-label={day.label}
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  disabled={!field.value.includes(day.value) && field.value.length >= 5}
                >
                  {day.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FormControl>
          <FormMessage>
            {selectedTrainingDays.length >= 5 && 
              "Vous avez atteint le nombre maximum de jours d'entraînement (5 jours)"}
          </FormMessage>
        </FormItem>
      )}
    />
  );
};
