import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Format de messages invalide" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`🏠 Estimation request with ${messages.length} messages`);

    // Specialized system prompt for real estate estimation
    const systemPrompt = `Tu es un expert immobilier IA spécialisé dans l'estimation de biens au Sénégal.

🎯 TON OBJECTIF : Obtenir les informations nécessaires pour estimer un bien immobilier avec précision.

📋 QUESTIONS À POSER (une par une, de manière conversationnelle) :
1. Type de bien (Appartement, Villa, Maison, Terrain, Bureau, Commerce)
2. Ville ou quartier au Sénégal (Dakar, Almadies, Mermoz, Point E, Thiès, Saly, etc.)
3. Superficie en m²
4. État général (Neuf, Excellent, Bon, À rénover)
5. Nombre de chambres (si applicable)
6. Nombre de salles de bain (si applicable)
7. Équipements particuliers (piscine, jardin, parking, climatisation, etc.)

💰 GRILLE TARIFAIRE SÉNÉGAL (FCFA/m²) :
**DAKAR - Zones Premium:**
- Almadies, Ngor, Ouakam: 800,000 - 1,500,000 FCFA/m²
- Mermoz, Fann, Point E: 600,000 - 1,000,000 FCFA/m²
- Plateau, Liberté: 500,000 - 800,000 FCFA/m²

**DAKAR - Zones Standard:**
- Parcelles Assainies, Guédiawaye: 250,000 - 450,000 FCFA/m²
- Pikine, Thiaroye: 200,000 - 350,000 FCFA/m²

**AUTRES VILLES:**
- Saly (bord de mer): 400,000 - 800,000 FCFA/m²
- Thiès centre: 200,000 - 400,000 FCFA/m²
- Saint-Louis: 150,000 - 350,000 FCFA/m²

**COEFFICIENTS:**
- État Neuf: +20%
- État Excellent: +10%
- État Bon: 0%
- À rénover: -30%
- Piscine: +15,000,000 FCFA
- Jardin aménagé: +5,000,000 FCFA
- Parking couvert: +3,000,000 FCFA

🗣️ STYLE DE CONVERSATION :
- Accueillant et professionnel
- Une question à la fois
- Confirme les réponses avant de passer à la suivante
- Utilise des emojis pour rendre la conversation agréable

📊 FORMAT D'ESTIMATION FINALE :
Quand tu as toutes les infos, présente :
1. Récapitulatif du bien
2. Calcul détaillé (superficie × prix/m² × coefficients)
3. Fourchette d'estimation (±15%)
4. Recommandation pour estimation précise par un agent

⚠️ IMPORTANT :
- Précise toujours qu'il s'agit d'une estimation indicative
- Conseille de contacter un agent pour une visite et estimation officielle
- Explique que le marché peut varier
- Ne donne jamais de conseils juridiques ou fiscaux

Commence par un message d'accueil chaleureux et demande le type de bien.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("❌ Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, veuillez réessayer dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("❌ Payment required");
        return new Response(
          JSON.stringify({ error: "Service temporairement indisponible." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("❌ AI gateway error:", response.status, errorText);
      throw new Error("Erreur de communication avec l'IA");
    }

    console.log("✅ Streaming estimation response started");
    
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("❌ Estimation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
