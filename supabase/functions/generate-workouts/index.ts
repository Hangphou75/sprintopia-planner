
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      objective, 
      mainDistance, 
      trainingPhase, 
      phaseDuration,
      sessionsPerWeek,
      startDate,
      mainCompetition 
    } = await req.json();

    // Construction du prompt pour DeepSeek
    const prompt = `En tant qu'expert en athlétisme, génère ${sessionsPerWeek} séances d'entraînement hebdomadaires pour un programme de ${phaseDuration} semaines.

Informations importantes :
- Distance principale : ${mainDistance}m
- Phase d'entraînement : ${trainingPhase}
- Objectif : ${objective}
- Compétition principale : ${mainCompetition.name} le ${mainCompetition.date}

Pour chaque séance, fournis :
- Un titre concis
- Un thème principal (parmi : aerobic, anaerobic-alactic, anaerobic-lactic, strength, technical, mobility, plyometric)
- Une description courte
- Des détails précis sur les exercices
- Un temps de récupération recommandé
- Une intensité suggérée

Format de réponse en JSON :
{
  "workouts": [
    {
      "title": "...",
      "theme": "...",
      "description": "...",
      "details": "...",
      "recovery": "...",
      "intensity": "..."
    }
  ]
}`;

    console.log("Sending request to DeepSeek API with prompt:", prompt);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en athlétisme spécialisé dans la création de programmes d'entraînement personnalisés."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log("Generated content:", generatedContent);

    // Parsage du JSON généré
    let workouts;
    try {
      workouts = JSON.parse(generatedContent).workouts;
    } catch (error) {
      console.error("Error parsing generated content:", error);
      throw new Error("Failed to parse generated workouts");
    }

    return new Response(
      JSON.stringify({ workouts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-workouts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
