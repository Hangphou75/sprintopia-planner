import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgramFormValues } from "../ProgramForm";

type CompetitionDetailsProps = {
  control: Control<ProgramFormValues>;
  namePrefix: "mainCompetition" | `otherCompetitions.${number}`;
  formId: string;
};

export const CompetitionDetails = ({ control, namePrefix, formId }: CompetitionDetailsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name={`${namePrefix}.distance` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={`${formId}-distance`}>Distance</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || "100"}>
              <FormControl>
                <SelectTrigger id={`${formId}-distance`}>
                  <SelectValue placeholder="Sélectionnez une distance" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="60">60m</SelectItem>
                <SelectItem value="100">100m</SelectItem>
                <SelectItem value="200">200m</SelectItem>
                <SelectItem value="400">400m</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`${namePrefix}.level` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={`${formId}-level`}>Niveau</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || "regional"}>
              <FormControl>
                <SelectTrigger id={`${formId}-level`}>
                  <SelectValue placeholder="Sélectionnez un niveau" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="regional">Régional</SelectItem>
                <SelectItem value="national">National</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};