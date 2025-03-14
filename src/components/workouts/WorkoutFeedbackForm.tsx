
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, AlertTriangle, Ban } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type FeedbackLevel = "good" | "adjusted" | "bad" | "canceled";

type WorkoutFeedbackFormProps = {
  workoutId: string;
  onSuccess?: () => void;
  existingFeedback?: {
    id?: string;
    level?: FeedbackLevel;
    notes?: string;
  };
};

export const WorkoutFeedbackForm = ({
  workoutId,
  onSuccess,
  existingFeedback,
}: WorkoutFeedbackFormProps) => {
  const [selectedLevel, setSelectedLevel] = useState<FeedbackLevel | null>(
    (existingFeedback?.level as FeedbackLevel) || null
  );
  const [notes, setNotes] = useState(existingFeedback?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackOptions = [
    {
      value: "good",
      label: "Bonne séance",
      icon: ThumbsUp,
      color: "bg-green-100 border-green-500 text-green-700",
      activeColor: "bg-green-500 text-white",
    },
    {
      value: "adjusted",
      label: "Ajustée",
      icon: AlertTriangle,
      color: "bg-yellow-100 border-yellow-500 text-yellow-700",
      activeColor: "bg-yellow-500 text-white",
    },
    {
      value: "bad",
      label: "Difficile",
      icon: ThumbsDown,
      color: "bg-orange-100 border-orange-500 text-orange-700",
      activeColor: "bg-orange-500 text-white",
    },
    {
      value: "canceled",
      label: "Avortée",
      icon: Ban,
      color: "bg-red-100 border-red-500 text-red-700",
      activeColor: "bg-red-500 text-white",
    },
  ];

  const handleSubmit = async () => {
    if (!selectedLevel) {
      toast.error("Veuillez sélectionner un niveau de ressenti");
      return;
    }

    try {
      setIsSubmitting(true);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Utilisateur non connecté");
        return;
      }

      const feedbackData = {
        workout_id: workoutId,
        user_id: userData.user.id,
        level: selectedLevel,
        notes: notes.trim() || null,
      };

      let result;
      
      if (existingFeedback?.id) {
        // Update existing feedback
        result = await supabase
          .from("workout_feedback")
          .update(feedbackData)
          .eq("id", existingFeedback.id);
      } else {
        // Insert new feedback
        result = await supabase.from("workout_feedback").insert(feedbackData);
      }

      if (result.error) {
        throw result.error;
      }

      toast.success("Feedback enregistré avec succès");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du feedback:", error);
      toast.error("Erreur lors de l'enregistrement du feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Comment s'est passée votre séance ?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {feedbackOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              className={`flex flex-col items-center justify-center h-24 p-2 border-2 ${
                selectedLevel === option.value
                  ? option.activeColor
                  : option.color
              }`}
              onClick={() => setSelectedLevel(option.value as FeedbackLevel)}
            >
              <option.icon className={`h-8 w-8 mb-2`} />
              <span className="text-sm font-medium">{option.label}</span>
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium">
            Commentaires (optionnel)
          </label>
          <Textarea
            id="notes"
            placeholder="Ajoutez des détails sur votre ressenti..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedLevel}
        >
          {isSubmitting ? "Enregistrement..." : "Enregistrer mon ressenti"}
        </Button>
      </CardFooter>
    </Card>
  );
};
