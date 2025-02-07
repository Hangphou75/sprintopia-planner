
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BasicProgramInfo } from "./components/program-generator/BasicProgramInfo";
import { TrainingDays } from "./components/program-generator/TrainingDays";
import { CompetitionInfo } from "./components/program-generator/CompetitionInfo";
import { PHASE_OPTIONS, DISTANCE_OPTIONS, DAYS_OF_WEEK } from "./constants/programOptions";
import { FormValues } from "./types/programTypes";
import { useProgramGeneration } from "./hooks/useProgramGeneration";

const GenerateProgram = () => {
  const navigate = useNavigate();
  const { generateProgram } = useProgramGeneration();

  const form = useForm<FormValues>({
    defaultValues: {
      objective: "",
      mainDistance: "",
      trainingPhase: "",
      phaseDuration: "",
      startDate: new Date(),
      mainCompetition: {
        name: "",
        date: "",
        location: "",
      },
      intermediateCompetitions: [],
      trainingDays: [],
    },
  });

  const selectedPhase = PHASE_OPTIONS.find(
    (phase) => phase.value === form.watch("trainingPhase")
  );

  const onSubmit = async (data: FormValues) => {
    if (selectedPhase) {
      await generateProgram(data, selectedPhase.label);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
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

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicProgramInfo 
              form={form} 
              DISTANCE_OPTIONS={DISTANCE_OPTIONS} 
              PHASE_OPTIONS={PHASE_OPTIONS} 
            />

            {selectedPhase && (
              <TrainingDays 
                form={form} 
                DAYS_OF_WEEK={DAYS_OF_WEEK} 
              />
            )}

            <Separator className="my-6" />

            <CompetitionInfo form={form} />

            <Button type="submit" className="w-full">
              Générer le programme
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default GenerateProgram;
