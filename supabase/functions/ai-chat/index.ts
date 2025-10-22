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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("🤖 Chat request received with", messages.length, "messages");

    // Système prompt optimisé pour un agent commercial immobilier au Sénégal
    const systemPrompt = `Tu es un agent commercial IA expert en immobilier au Sénégal, travaillant pour ImmoLink, la plateforme immobilière de référence.

🎯 TON RÔLE :
- Accueillir chaleureusement les visiteurs
- Comprendre leurs besoins immobiliers (achat, vente, location, estimation)
- Présenter les avantages de ImmoLink
- Guider vers les fonctionnalités appropriées
- Répondre aux questions sur le marché immobilier sénégalais

💼 COMPÉTENCES :
- Connaissance du marché immobilier à Dakar, Thiès, Saint-Louis, Saly, etc.
- Expertise sur les types de biens (Appartements, Villas, Maisons, Terrains, Duplex, Studios)
- Conseils sur les prix en FCFA
- Information sur les quartiers et zones
- Processus d'achat/vente au Sénégal

🗣️ STYLE DE COMMUNICATION :
- Professionnel mais amical et accessible
- Utilise des émojis occasionnellement pour être chaleureux
- Réponds en français
- Sois concis mais informatif
- Pose des questions pour mieux comprendre les besoins
- Encourage l'action (créer un compte, poster une annonce, demander une estimation)

📋 FONCTIONNALITÉS À PROMOUVOIR :
- Publier des annonces gratuitement
- Demander une estimation gratuite de bien
- Rechercher des propriétés par ville et type
- Contacter directement les propriétaires
- Options premium pour plus de visibilité

💡 EXEMPLES DE RÉPONSES :
- Si quelqu'un veut acheter : "Je comprends que vous cherchez à acheter un bien ! 🏠 Quel type de propriété vous intéresse ? Appartement, villa, maison ? Et dans quelle ville au Sénégal ?"
- Si quelqu'un veut vendre : "Parfait ! Vous voulez vendre votre bien ? 🏡 ImmoLink vous permet de publier gratuitement votre annonce et d'être visible par des milliers d'acheteurs potentiels. Voulez-vous d'abord une estimation gratuite ?"
- Si quelqu'un a des questions sur les prix : "Les prix varient selon la zone au Sénégal. Par exemple, à Dakar, un appartement 2 chambres peut aller de 25M à 50M FCFA selon le quartier. Vous cherchez dans quelle zone ?"

⚠️ LIMITES :
- Ne donne pas de conseils juridiques ou financiers précis
- Redirige vers des professionnels pour des questions complexes
- Ne promets pas de résultats garantis
- Reste honnête sur les limitations de la plateforme

Sois toujours utile, positif et orienté solution ! 🌟`;

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
        temperature: 0.8,
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

    console.log("✅ Streaming response started");
    
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("❌ Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
