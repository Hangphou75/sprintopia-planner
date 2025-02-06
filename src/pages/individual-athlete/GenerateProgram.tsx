
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const GenerateProgram = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/individual-athlete/planning")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Générer un programme</h1>
      </div>

      <div className="text-center py-12">
        <p className="text-muted-foreground">
          La génération de programme sera bientôt disponible.
        </p>
      </div>
    </div>
  );
};

export default GenerateProgram;
