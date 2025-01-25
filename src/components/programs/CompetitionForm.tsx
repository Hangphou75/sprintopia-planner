import { Control } from "react-hook-form";
import { Trophy } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProgramFormValues } from "./ProgramForm";

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
      <div className="flex justify-between items-center">
        {isMain ? (
          <h3 className="text-lg font-semibold flex items-center">
            <Trophy className="mr-2 h-4 w-4" />
            Compétition principale
          </h3>
        ) : (
          <div className="flex justify-between items-center w-full">
            <h4 className="font-medium">Compétition intermédiaire</h4>
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
              >
                Supprimer
              </Button>
            )}
          </div>
        )}
      </div>

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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`${namePrefix}.distance` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={`${formId}-distance`}>Distance</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
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
              <Select onValueChange={field.onChange} value={field.value}>
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
    </div>
  );
};