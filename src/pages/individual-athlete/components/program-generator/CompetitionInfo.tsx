
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../../GenerateProgram";

interface CompetitionInfoProps {
  form: UseFormReturn<FormValues>;
}

export const CompetitionInfo = ({ form }: CompetitionInfoProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Compétition principale</h3>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="mainCompetition.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la compétition</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mainCompetition.date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mainCompetition.location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lieu</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
