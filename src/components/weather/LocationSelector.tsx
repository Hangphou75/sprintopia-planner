
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { popularCities } from "./constants";

interface LocationSelectorProps {
  location: string;
  setLocation: (location: string) => void;
  customLocation: string;
  setCustomLocation: (location: string) => void;
  showCustomInput: boolean;
  setShowCustomInput: (show: boolean) => void;
  handleLocationInput: () => void;
}

export const LocationSelector = ({
  location,
  setLocation,
  customLocation,
  setCustomLocation,
  showCustomInput,
  setShowCustomInput,
  handleLocationInput
}: LocationSelectorProps) => {
  if (!showCustomInput) {
    return (
      <div className="w-full">
        <Select 
          value={location} 
          onValueChange={(value) => {
            if (value === "custom") {
              setShowCustomInput(true);
            } else {
              setLocation(value);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir une ville" />
          </SelectTrigger>
          <SelectContent>
            {popularCities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
            <SelectItem value="custom">Autre ville...</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Input
        placeholder="Saisir une ville"
        value={customLocation}
        onChange={(e) => setCustomLocation(e.target.value)}
        className="w-full"
      />
      <div className="flex space-x-2">
        <Button size="sm" onClick={handleLocationInput}>
          Ok
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setShowCustomInput(false)}
        >
          Annuler
        </Button>
      </div>
    </div>
  );
};
