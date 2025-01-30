import { Control } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProgramFormValues } from "./ProgramForm";
import { CompetitionHeader } from "./competition/CompetitionHeader";
import { CompetitionBasicInfo } from "./competition/CompetitionBasicInfo";
import { CompetitionDetails } from "./competition/CompetitionDetails";

type CompetitionFormProps = {
  control: Control<ProgramFormValues>;
  isMain: boolean;
  namePrefix: "mainCompetition" | `otherCompetitions.${number}`;
  onRemove?: () => void;
};

export const CompetitionForm = ({
  control,
  isMain,
  namePrefix,
  onRemove,
}: CompetitionFormProps) => {
  const formId = isMain ? "main-competition" : `competition-${namePrefix.split(".")[1]}`;

  return (
    <div className="space-y-4">
      <CompetitionHeader isMain={isMain} onRemove={onRemove} />

      <CompetitionBasicInfo 
        control={control} 
        namePrefix={namePrefix} 
        formId={formId} 
      />

      <CompetitionDetails 
        control={control} 
        namePrefix={namePrefix} 
        formId={formId} 
      />

      <FormField
        control={control}
        name={`${namePrefix}.date` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={`${formId}-date`}>Date</FormLabel>
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={field.onChange}
              disabled={(date) =>
                date < new Date() || date < new Date("1900-01-01")
              }
              className="rounded-md border"
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};