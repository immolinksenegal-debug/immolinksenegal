import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contractId } = await req.json();

    if (!contractId) {
      throw new Error('Contract ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get contract data
    const { data: contract, error: contractError } = await supabase
      .from('property_contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      throw new Error('Contract not found');
    }

    // Generate HTML for PDF
    const html = generateContractHTML(contract);

    // Update contract status
    await supabase
      .from('property_contracts')
      .update({ 
        status: 'generated',
        pdf_url: `data:text/html;base64,${btoa(html)}`
      })
      .eq('id', contractId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        html,
        message: 'Contract PDF generated successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error generating contract PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

function generateContractHTML(contract: any): string {
  const currentDate = new Date().toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const startDate = new Date(contract.start_date).toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const endDate = contract.end_date 
    ? new Date(contract.end_date).toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : 'Indéterminée';

  const isMandat = contract.contract_type === 'mandat_gestion';
  const title = isMandat ? 'MANDAT DE GESTION' : 'CONTRAT DE LOCATION';

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Georgia', serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #fff;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #000;
      padding-bottom: 20px;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .header .subtitle {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }
    
    .date {
      text-align: right;
      margin-bottom: 30px;
      font-style: italic;
      color: #666;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      text-transform: uppercase;
      border-bottom: 2px solid #000;
      padding-bottom: 5px;
    }
    
    .party {
      margin-bottom: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-left: 4px solid #000;
    }
    
    .party-title {
      font-weight: bold;
      margin-bottom: 10px;
      font-size: 16px;
    }
    
    .info-row {
      margin-bottom: 8px;
      padding-left: 20px;
    }
    
    .info-label {
      font-weight: bold;
      display: inline-block;
      min-width: 150px;
    }
    
    .article {
      margin-bottom: 20px;
      padding: 15px;
      border: 1px solid #ddd;
      background: #fafafa;
    }
    
    .article-title {
      font-weight: bold;
      margin-bottom: 10px;
      font-size: 16px;
    }
    
    .article-content {
      text-align: justify;
      line-height: 1.8;
    }
    
    .signature-section {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
    }
    
    .signature-box {
      width: 45%;
      text-align: center;
      padding-top: 20px;
    }
    
    .signature-line {
      border-top: 2px solid #000;
      margin-top: 80px;
      padding-top: 10px;
      font-weight: bold;
    }
    
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .signature-section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="subtitle">Immo Link Sénégal</div>
  </div>

  <div class="date">
    Fait à Dakar, le ${currentDate}
  </div>

  <div class="section">
    <div class="section-title">Entre les soussignés</div>
    
    <div class="party">
      <div class="party-title">${isMandat ? 'LE MANDANT (Propriétaire)' : 'LE BAILLEUR (Propriétaire)'}</div>
      <div class="info-row">
        <span class="info-label">Nom et Prénom :</span> ${contract.owner_name}
      </div>
      <div class="info-row">
        <span class="info-label">Adresse :</span> ${contract.owner_address}
      </div>
      <div class="info-row">
        <span class="info-label">Email :</span> ${contract.owner_email}
      </div>
      ${contract.owner_phone ? `<div class="info-row"><span class="info-label">Téléphone :</span> ${contract.owner_phone}</div>` : ''}
      ${contract.owner_id_number ? `<div class="info-row"><span class="info-label">N° Pièce d'identité :</span> ${contract.owner_id_number}</div>` : ''}
    </div>

    ${!isMandat && contract.tenant_name ? `
    <div class="party">
      <div class="party-title">LE LOCATAIRE</div>
      <div class="info-row">
        <span class="info-label">Nom et Prénom :</span> ${contract.tenant_name}
      </div>
      ${contract.tenant_address ? `<div class="info-row"><span class="info-label">Adresse :</span> ${contract.tenant_address}</div>` : ''}
      ${contract.tenant_email ? `<div class="info-row"><span class="info-label">Email :</span> ${contract.tenant_email}</div>` : ''}
      ${contract.tenant_phone ? `<div class="info-row"><span class="info-label">Téléphone :</span> ${contract.tenant_phone}</div>` : ''}
      ${contract.tenant_id_number ? `<div class="info-row"><span class="info-label">N° Pièce d'identité :</span> ${contract.tenant_id_number}</div>` : ''}
    </div>
    ` : ''}

    <div class="party">
      <div class="party-title">${isMandat ? 'LE MANDATAIRE' : "L'AGENCE"} (Immo Link Sénégal)</div>
      <div class="info-row">
        <span class="info-label">Raison sociale :</span> Immo Link Sénégal
      </div>
      <div class="info-row">
        <span class="info-label">Siège social :</span> Dakar, Sénégal
      </div>
      <div class="info-row">
        <span class="info-label">Email :</span> contact@immolink.sn
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Objet du bien</div>
    <div class="article">
      <div class="info-row">
        <span class="info-label">Type de bien :</span> ${contract.property_type}
      </div>
      <div class="info-row">
        <span class="info-label">Adresse :</span> ${contract.property_address}
      </div>
      ${contract.property_surface ? `<div class="info-row"><span class="info-label">Surface :</span> ${contract.property_surface} m²</div>` : ''}
      ${contract.property_description ? `<div class="info-row" style="margin-top: 10px;"><span class="info-label">Description :</span><br/>${contract.property_description}</div>` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Clauses et Conditions</div>
    
    <div class="article">
      <div class="article-title">Article 1 - Durée</div>
      <div class="article-content">
        Le présent ${isMandat ? 'mandat' : 'contrat'} est conclu pour une durée ${contract.end_date ? 'déterminée' : 'indéterminée'}, 
        prenant effet le ${startDate}${contract.end_date ? ` et se terminant le ${endDate}` : ''}.
      </div>
    </div>

    <div class="article">
      <div class="article-title">Article 2 - Loyer et Charges</div>
      <div class="article-content">
        Le loyer mensuel est fixé à ${contract.monthly_rent.toLocaleString()} FCFA (${numberToWords(contract.monthly_rent)} francs CFA).
        ${contract.security_deposit ? `<br/>Une caution de ${contract.security_deposit.toLocaleString()} FCFA est exigée.` : ''}
      </div>
    </div>

    ${isMandat ? `
    <div class="article">
      <div class="article-title">Article 3 - Commission de Gestion</div>
      <div class="article-content">
        Le mandataire percevra une commission de gestion de ${contract.commission_rate}% du montant des loyers encaissés,
        en rémunération de ses services de gestion locative.
      </div>
    </div>
    ` : ''}

    <div class="article">
      <div class="article-title">Article ${isMandat ? '4' : '3'} - Obligations des Parties</div>
      <div class="article-content">
        ${isMandat ? `
        Le mandant s'engage à fournir tous les documents nécessaires à la gestion du bien.
        Le mandataire s'engage à rechercher un locataire solvable, gérer les loyers et l'entretien courant du bien.
        ` : `
        Le bailleur s'engage à délivrer le bien en bon état d'usage et d'entretien.
        Le locataire s'engage à payer le loyer aux échéances convenues et à user du bien en bon père de famille.
        `}
      </div>
    </div>

    ${contract.special_conditions ? `
    <div class="article">
      <div class="article-title">Article ${isMandat ? '5' : '4'} - Conditions Particulières</div>
      <div class="article-content">
        ${contract.special_conditions}
      </div>
    </div>
    ` : ''}

    <div class="article">
      <div class="article-title">Article ${isMandat ? (contract.special_conditions ? '6' : '5') : (contract.special_conditions ? '5' : '4')} - Résiliation</div>
      <div class="article-content">
        ${isMandat ? `
        Le présent mandat peut être résilié par l'une ou l'autre des parties moyennant un préavis de trois (3) mois,
        sauf accord contraire entre les parties.
        ` : `
        Le présent contrat peut être résilié par le locataire moyennant un préavis de trois (3) mois.
        Le bailleur ne peut résilier le bail que pour les motifs légalement prévus.
        `}
      </div>
    </div>

    <div class="article">
      <div class="article-title">Article ${isMandat ? (contract.special_conditions ? '7' : '6') : (contract.special_conditions ? '6' : '5')} - Juridiction Compétente</div>
      <div class="article-content">
        Tout litige relatif à l'exécution du présent ${isMandat ? 'mandat' : 'contrat'} sera soumis à la juridiction compétente de Dakar, Sénégal.
      </div>
    </div>
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <div>Le ${isMandat ? 'Mandant' : 'Bailleur'}</div>
      <div class="signature-line">${contract.owner_name}</div>
    </div>
    
    ${!isMandat && contract.tenant_name ? `
    <div class="signature-box">
      <div>Le Locataire</div>
      <div class="signature-line">${contract.tenant_name}</div>
    </div>
    ` : ''}
    
    <div class="signature-box">
      <div>${isMandat ? 'Le Mandataire' : "L'Agence"}</div>
      <div class="signature-line">Immo Link Sénégal</div>
    </div>
  </div>

  <div class="footer">
    Document généré par Immo Link Sénégal - Plateforme de gestion immobilière
    <br/>
    Dakar, Sénégal - contact@immolink.sn
  </div>
</body>
</html>
  `;
}

function numberToWords(num: number): string {
  // Simple implementation for French numbers - can be expanded
  if (num === 0) return 'zéro';
  
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  
  // For simplicity, just return the string version for larger numbers
  return num.toLocaleString();
}