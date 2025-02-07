import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../../types/programTypes";

interface BasicProgramInfoProps {
  form: UseFormReturn<FormValues>;
  DISTANCE_OPTIONS: Array<{ value: string; label: string; }>;
  PHASE_OPTIONS: Array<{
    value: string;
    label: string;
    durations: string[];
  }>;
}

export const BasicProgramInfo = ({ form, DISTANCE_OPTIONS, PHASE_OPTIONS }: BasicProgramInfoProps) => {
  const selectedPhase = PHASE_OPTIONS.find(
    (phase) => phase.value === form.watch("trainingPhase")
  );

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="startDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date de début</FormLabel>
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={field.onChange}
              disabled={(date) =>
                date < new Date() || date < new Date("1900-01-01")
              }
              initialFocus
              className="rounded-md border"
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="objective"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Objectif principal</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Améliorer mon temps sur 100m" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="mainDistance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Distance travaillée</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une distance" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {DISTANCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="trainingPhase"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phase à travailler</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une phase" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PHASE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedPhase && (
        <FormField
          control={form.control}
          name="phaseDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Durée de la phase</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une durée" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {selectedPhase.durations.map((duration) => (
                    <SelectItem key={duration} value={duration}>
                      {duration} semaines
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
