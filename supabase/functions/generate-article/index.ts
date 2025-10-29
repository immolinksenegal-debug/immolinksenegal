import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea } = await req.json();

    if (!idea) {
      return new Response(
        JSON.stringify({ error: 'Idée d\'article requise' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Étape 1: Générer le texte de l'article
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en rédaction d'articles immobiliers pour le marché sénégalais. 
            Tu rédiges des articles professionnels, informatifs et engageants sur l'immobilier au Sénégal.
            
            Format de réponse (JSON uniquement):
            {
              "title": "Titre accrocheur de l'article",
              "excerpt": "Résumé court de 2-3 phrases",
              "content": "Contenu complet de l'article en HTML avec balises <h2>, <h3>, <p>, <ul>, etc."
            }`
          },
          {
            role: 'user',
            content: `Génère un article complet et professionnel sur le sujet suivant pour le marché immobilier sénégalais : "${idea}".
            
            L'article doit:
            - Faire entre 800 et 1200 mots
            - Être structuré avec plusieurs sections (h2, h3)
            - Contenir des informations pertinentes pour le Sénégal
            - Avoir un ton professionnel mais accessible
            - Inclure des conseils pratiques
            - Être optimisé pour le SEO
            
            Réponds UNIQUEMENT avec le JSON demandé, sans texte avant ou après.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de taux atteinte. Veuillez réessayer plus tard.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crédits insuffisants. Veuillez ajouter des crédits à votre compte Lovable.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API returned ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices[0].message.content;

    // Parse the JSON response from AI
    let article;
    try {
      const cleanedContent = generatedContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      article = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', generatedContent);
      throw new Error('Format de réponse invalide de l\'IA');
    }

    // Étape 2: Générer une image pour l'article
    console.log('Generating image for article:', article.title);
    
    const imagePrompt = `Professional real estate image for article about: ${idea}. Modern Senegalese architecture, elegant style with brown and blue tones. High quality, 16:9 aspect ratio.`;
    
    const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: imagePrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!imageResponse.ok) {
      console.error('Image generation failed:', imageResponse.status);
      // Continue without image if generation fails
      return new Response(
        JSON.stringify(article),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (imageUrl && imageUrl.startsWith('data:image')) {
      // Convertir base64 en blob
      const base64Data = imageUrl.split(',')[1];
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      // Générer un nom de fichier unique
      const fileName = `article-${Date.now()}.png`;
      
      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, binaryData, {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
      } else {
        // Obtenir l'URL publique de l'image
        const { data: publicUrlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);
        
        article.featured_image = publicUrlData.publicUrl;
        console.log('Image uploaded successfully:', article.featured_image);
      }
    }

    return new Response(
      JSON.stringify(article),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-article function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la génération de l\'article';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
