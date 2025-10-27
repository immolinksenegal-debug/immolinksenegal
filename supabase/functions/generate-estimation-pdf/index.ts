import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
      property_type,
      location,
      city,
      surface,
      bedrooms,
      bathrooms,
      condition,
      description,
      contact_name,
      contact_email,
      contact_phone
    } = await req.json();

    console.log('Generating estimation for:', { property_type, city, location });

    // Utiliser Lovable AI pour analyser et générer une estimation intelligente
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiPrompt = `Tu es un expert en estimation immobilière au Sénégal. Analyse les informations suivantes et fournis une estimation de prix réaliste et professionnelle:

Type de bien: ${property_type}
Ville: ${city}
Localisation: ${location}
Surface: ${surface || 'Non spécifié'} m²
Chambres: ${bedrooms || 'Non spécifié'}
Salles de bain: ${bathrooms || 'Non spécifié'}
État: ${condition || 'Non spécifié'}
Description: ${description || 'Aucune'}

Fournis une estimation détaillée incluant:
1. Fourchette de prix en FCFA (minimum - maximum)
2. Analyse des facteurs influençant le prix (localisation, état, marché actuel)
3. Conseils pour optimiser la valeur du bien
4. Tendances du marché pour ce type de bien dans cette zone

Format ta réponse de manière structurée et professionnelle en français.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Tu es un expert en estimation immobilière au Sénégal, spécialisé dans l\'analyse de marché et l\'évaluation de biens. Tu fournis des estimations précises basées sur les tendances actuelles du marché sénégalais.' },
          { role: 'user', content: aiPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiEstimation = aiData.choices[0].message.content;

    console.log('AI estimation generated successfully');

    // Générer le contenu HTML du PDF
    const htmlContent = generatePDFHTML({
      property_type,
      location,
      city,
      surface,
      bedrooms,
      bathrooms,
      condition,
      description,
      contact_name,
      contact_email,
      contact_phone,
      aiEstimation,
      date: new Date().toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    });

    // Utiliser un service de conversion HTML vers PDF
    // Pour simplifier, on retourne le HTML et l'estimation
    // Le client peut utiliser window.print() ou une bibliothèque côté client
    console.log('PDF content generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        htmlContent,
        estimation: aiEstimation,
        propertyInfo: {
          property_type,
          location,
          city,
          surface,
          bedrooms,
          bathrooms,
          condition,
          description,
          contact_name,
          contact_email,
          contact_phone
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating estimation:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generatePDFHTML(data: any): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Estimation Immobilière - Immo Link Sénégal</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      background: linear-gradient(135deg, #0b2f64 0%, #6b4a2b 100%);
      color: white;
      padding: 40px;
      border-radius: 10px;
      margin-bottom: 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .header p {
      font-size: 18px;
      opacity: 0.95;
    }
    .section {
      background: #f8f9fa;
      border-left: 4px solid #ed743c;
      padding: 25px;
      margin-bottom: 25px;
      border-radius: 8px;
    }
    .section h2 {
      color: #0b2f64;
      font-size: 22px;
      margin-bottom: 15px;
      font-weight: 600;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 15px;
    }
    .info-item {
      padding: 10px;
      background: white;
      border-radius: 6px;
    }
    .info-label {
      font-weight: 600;
      color: #6b4a2b;
      font-size: 14px;
      margin-bottom: 5px;
    }
    .info-value {
      color: #333;
      font-size: 16px;
    }
    .estimation-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      line-height: 1.8;
      white-space: pre-line;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
    }
    .contact-info {
      margin-top: 15px;
      font-size: 14px;
    }
    .logo-text {
      font-size: 14px;
      margin-top: 10px;
      color: rgba(255,255,255,0.9);
    }
    @media print {
      body { background: white; }
      .container { padding: 20px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏡 IMMO LINK SÉNÉGAL</h1>
      <p>Rapport d'Estimation Immobilière</p>
      <p class="logo-text">Votre partenaire immobilier de confiance</p>
      <p style="font-size: 14px; margin-top: 10px;">Généré le ${data.date}</p>
    </div>

    <div class="section">
      <h2>📋 Informations Client</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Nom</div>
          <div class="info-value">${data.contact_name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Email</div>
          <div class="info-value">${data.contact_email}</div>
        </div>
        <div class="info-item" style="grid-column: span 2;">
          <div class="info-label">Téléphone</div>
          <div class="info-value">${data.contact_phone}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>🏠 Caractéristiques du Bien</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Type</div>
          <div class="info-value">${data.property_type}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Ville</div>
          <div class="info-value">${data.city}</div>
        </div>
        <div class="info-item" style="grid-column: span 2;">
          <div class="info-label">Localisation</div>
          <div class="info-value">${data.location}</div>
        </div>
        ${data.surface ? `<div class="info-item">
          <div class="info-label">Surface</div>
          <div class="info-value">${data.surface} m²</div>
        </div>` : ''}
        ${data.bedrooms ? `<div class="info-item">
          <div class="info-label">Chambres</div>
          <div class="info-value">${data.bedrooms}</div>
        </div>` : ''}
        ${data.bathrooms ? `<div class="info-item">
          <div class="info-label">Salles de bain</div>
          <div class="info-value">${data.bathrooms}</div>
        </div>` : ''}
        ${data.condition ? `<div class="info-item">
          <div class="info-label">État</div>
          <div class="info-value">${data.condition}</div>
        </div>` : ''}
      </div>
      ${data.description ? `
        <div style="margin-top: 15px;">
          <div class="info-label">Description</div>
          <div class="info-value" style="margin-top: 8px;">${data.description}</div>
        </div>
      ` : ''}
    </div>

    <div class="section">
      <h2>💡 Estimation Intelligente par IA</h2>
      <div class="estimation-content">
        ${data.aiEstimation}
      </div>
    </div>

    <div class="footer">
      <p><strong>IMMO LINK SÉNÉGAL</strong></p>
      <div class="contact-info">
        <p>📧 contact@immolinksenegal.com</p>
        <p>🌐 www.immolinksenegal.com</p>
        <p>📱 +221 XX XXX XX XX</p>
      </div>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        Ce rapport a été généré automatiquement par notre système d'intelligence artificielle.<br>
        Pour une estimation détaillée, contactez nos experts.
      </p>
    </div>
  </div>
</body>
</html>`;
}
