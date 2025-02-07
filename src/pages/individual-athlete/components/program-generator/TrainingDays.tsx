
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../../GenerateProgram";

interface TrainingDaysProps {
  form: UseFormReturn<FormValues>;
  DAYS_OF_WEEK: Array<{ value: string; label: string; }>;
}

export const TrainingDays = ({ form, DAYS_OF_WEEK }: TrainingDaysProps) => {
  const selectedTrainingDays = form.watch("trainingDays");

  return (
    <FormField
      control={form.control}
      name="trainingDays"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Jours d'entraînement ({selectedTrainingDays.length} séances/semaine)</FormLabel>
          <FormControl>
            <ToggleGroup
              type="multiple"
              value={field.value}
              onValueChange={field.onChange}
              className="flex flex-wrap gap-2"
            >
              {DAYS_OF_WEEK.map((day) => (
                <ToggleGroupItem
                  key={day.value}
                  value={day.value}
                  aria-label={day.label}
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {day.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
