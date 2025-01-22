import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const CoachPlanning = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Program Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Program
        </Button>
      </div>
      <p className="text-gray-500">No programs created</p>
    </div>
  );
};

export default CoachPlanning;