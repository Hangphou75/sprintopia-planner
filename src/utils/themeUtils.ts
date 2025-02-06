
export const getThemeLabel = (theme: string) => {
  const themeMap: { [key: string]: string } = {
    "aerobic": "Aérobie",
    "anaerobic-lactic": "Anaérobie lactique",
    "anaerobic-alactic": "Anaérobie alactique",
    "mobility": "Mobilité",
    "conditioning": "Préparation physique",
    "strength": "Force",
    "power": "Puissance",
    "competition": "Compétition",
    "recovery": "Récupération",
    "technical": "Technique",
    "speed": "Vitesse",
    "endurance": "Endurance",
    "alactic": "Anaérobie alactique",
    "lactic": "Anaérobie lactique"
  };
  return themeMap[theme] || theme;
};
