import { Program } from "@/types/program";

type ProgramCardProps = {
  program: Program;
};

export const ProgramCard = ({ program }: ProgramCardProps) => {
  return (
    <div className="p-6 border rounded-lg hover:border-primary transition-colors bg-card">
      <h3 className="font-semibold text-lg mb-2">{program.name}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {program.duration} semaines - Début le{" "}
        {new Date(program.start_date).toLocaleDateString()}
      </p>
      {program.objectives && (
        <p className="text-sm text-card-foreground">{program.objectives}</p>
      )}
    </div>
  );
};