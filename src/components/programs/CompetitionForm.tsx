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
  namePrefix: string;
  onRemove?: () => void;
};

export const CompetitionForm = ({
  control,
  isMain,
  namePrefix,
  onRemove,
}: CompetitionFormProps) => {
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
        name={`${namePrefix}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom de la compétition</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Championnats de France" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`${namePrefix}.distance`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distance</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
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
          name={`${namePrefix}.level`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Niveau</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
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
        name={`${namePrefix}.date`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
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
        name={`${namePrefix}.location`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lieu</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Stade Charléty" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};