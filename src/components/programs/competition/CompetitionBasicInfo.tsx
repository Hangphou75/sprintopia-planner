import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProgramFormValues } from "../ProgramForm";

type CompetitionBasicInfoProps = {
  control: Control<ProgramFormValues>;
  namePrefix: "mainCompetition" | `otherCompetitions.${number}`;
  formId: string;
};

export const CompetitionBasicInfo = ({ control, namePrefix, formId }: CompetitionBasicInfoProps) => {
  return (
    <>
      <FormField
        control={control}
        name={`${namePrefix}.name` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={`${formId}-name`}>Nom de la compétition</FormLabel>
            <FormControl>
              <Input id={`${formId}-name`} placeholder="Ex: Championnats de France" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`${namePrefix}.location` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={`${formId}-location`}>Lieu</FormLabel>
            <FormControl>
              <Input id={`${formId}-location`} placeholder="Ex: Stade Charléty" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};