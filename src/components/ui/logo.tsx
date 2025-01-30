import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src="/lovable-uploads/47bd958b-0640-41a2-badc-213a9fd31933.png" 
        alt="Sprintopia" 
        className="h-8"
      />
    </div>
  );
};