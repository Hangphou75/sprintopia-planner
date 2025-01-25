import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Program } from "@/types/program";
import { useNavigate } from "react-router-dom";

const CoachPlanning = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: programs, refetch } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      console.log("Fetching programs for user:", user?.id);
      const { data, error } = await supabase
        .from("programs")
        .select("*, competitions(*)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching programs:", error);
        throw error;
      }

      console.log("Programs fetched:", data);
      return data as Program[];
    },
  });

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestion des programmes</h1>
        <Button 
          className="bg-[#0F172A] text-white hover:bg-[#1E293B]"
          onClick={() => navigate("/coach/programs/create")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Programme
        </Button>
      </div>
      <ScrollArea className="flex-1 px-1">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {!programs || programs.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-8">
              Aucun programme créé
            </p>
          ) : (
            programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CoachPlanning;