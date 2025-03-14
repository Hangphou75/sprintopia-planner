
interface AthleteLoadingStateProps {
  isLoading: boolean;
  error: unknown;
}

export const AthleteLoadingState = ({ isLoading, error }: AthleteLoadingStateProps) => {
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Chargement des athlètes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">Une erreur est survenue lors du chargement des athlètes</p>
        <p className="mt-2 text-muted-foreground">{String(error)}</p>
      </div>
    );
  }

  return null;
};
