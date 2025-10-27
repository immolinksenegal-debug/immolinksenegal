import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client with service role for rate limiting
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Check rate limit (20 requests per hour per IP)
    const { data: rateData } = await supabaseAdmin
      .from('chat_rate_limits')
      .select('request_count, window_start')
      .eq('ip_address', clientIP)
      .maybeSingle();

    const oneHourAgo = new Date(Date.now() - 3600000);
    
    if (rateData) {
      const windowStart = new Date(rateData.window_start);
      
      if (windowStart > oneHourAgo) {
        if (rateData.request_count >= 20) {
          console.warn(`⚠️ Rate limit exceeded for IP ${clientIP}`);
          return new Response(
            JSON.stringify({ 
              error: "Limite de requêtes atteinte. Veuillez réessayer dans une heure.",
              retryAfter: 3600 
            }),
            { 
              status: 429, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        // Increment counter
        await supabaseAdmin
          .from('chat_rate_limits')
          .update({ 
            request_count: rateData.request_count + 1,
            last_request: new Date().toISOString()
          })
          .eq('ip_address', clientIP);
      } else {
        // Reset window
        await supabaseAdmin
          .from('chat_rate_limits')
          .update({ 
            request_count: 1,
            window_start: new Date().toISOString(),
            last_request: new Date().toISOString()
          })
          .eq('ip_address', clientIP);
      }
    } else {
      // Create new rate limit entry
      await supabaseAdmin
        .from('chat_rate_limits')
        .insert({ 
          ip_address: clientIP,
          request_count: 1,
          window_start: new Date().toISOString(),
          last_request: new Date().toISOString()
        });
    }

    const { messages } = await req.json();

    // Validate messages array
    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Format de messages invalide" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (messages.length === 0 || messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Le nombre de messages doit être entre 1 et 50" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return new Response(
          JSON.stringify({ error: "Structure de message invalide" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (msg.role !== 'user' && msg.role !== 'assistant') {
        return new Response(
          JSON.stringify({ error: "Rôle de message invalide" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (typeof msg.content !== 'string' || msg.content.length > 2000) {
        return new Response(
          JSON.stringify({ error: "Contenu de message trop long ou invalide" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check for suspicious patterns (potential prompt injection)
      const suspiciousPatterns = [
        /ignore\s+(previous|all|prior)\s+instructions?/i,
        /what\s+(were|are)\s+you\s+told/i,
        /repeat\s+(everything|all|your\s+instructions?)/i,
        /system\s+prompt/i,
        /\[SYSTEM\]/i,
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(msg.content)) {
          console.warn(`⚠️ Potential prompt injection attempt from IP ${clientIP}: ${msg.content.substring(0, 100)}`);
          // Continue processing but log the attempt
          break;
        }
      }
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`🤖 Chat request from IP ${clientIP} with ${messages.length} messages`);

    // Simplified system prompt to reduce information leakage
    const systemPrompt = `Tu es un assistant immobilier professionnel IA pour Immo Link Sénégal (immolinksenegal.com).

🎯 TON RÔLE : Aider les utilisateurs avec leurs besoins immobiliers au Sénégal.

💼 TES SERVICES :
- Recherche de biens (villas, appartements, maisons, terrains, bureaux)
- Estimation gratuite de biens immobiliers
- Conseils sur achat, vente, location au Sénégal
- Gestion locative professionnelle
- Informations sur le marché (Dakar, Thiès, Saint-Louis, Saly, Mbour, etc.)

📊 POUR LES ESTIMATIONS :
Demande toujours : type de bien, localisation précise, surface (m²), nombre de chambres/bains, état (neuf/bon/à rénover).
Fournis une fourchette de prix réaliste en FCFA basée sur le marché sénégalais actuel.
Suggère de contacter Immo Link pour une estimation détaillée gratuite.

🗣️ STYLE : Professionnel, cordial, précis. Utilise des émojis appropriés (🏡🏢💰📍).

⚠️ LIMITES : Ne donne pas de conseils juridiques/financiers précis. Redirige vers des professionnels.

Si la question n'est pas liée à l'immobilier, réponds poliment que tu es spécialisé dans l'immobilier sénégalais.`;

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
