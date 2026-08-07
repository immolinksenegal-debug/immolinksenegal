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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { contractId } = await req.json();

    if (!contractId || typeof contractId !== 'string') {
      throw new Error('Contract ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Authenticate the caller
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const callerId = userData.user.id;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get contract data with signatures
    const { data: contract, error: contractError } = await supabase
      .from('property_contracts')
      .select(`
        *,
        signatures:contract_signatures(*)
      `)
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      throw new Error('Contract not found');
    }

    // Authorization: owner of the contract or admin only
    if (contract.user_id !== callerId) {
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', callerId)
        .eq('role', 'admin')
        .maybeSingle();
      if (!adminRole) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }


    // Generate HTML for PDF
    const html = generateContractHTML(contract);

    // Update contract status
    await supabase
      .from('property_contracts')
      .update({ 
        status: 'generated'
      })
      .eq('id', contractId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        html,
        message: 'Contract PDF generated successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
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
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const logoUrl = `${supabaseUrl.replace('.supabase.co', '.lovableproject.com')}/logo-immo-link-contract.png`;

  // Get signatures (passed from the function)
  const ownerSignature = contract.signatures?.find((s: any) => s.signer_type === 'owner');
  const tenantSignature = contract.signatures?.find((s: any) => s.signer_type === 'tenant');
  const agencySignature = contract.signatures?.find((s: any) => s.signer_type === 'agency');

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
    
    @page {
      margin: 2cm;
    }
    
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #fff;
    }
    
    .header {
      text-align: center;
      margin-bottom: 50px;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
    }
    
    .logo {
      width: 180px;
      height: auto;
      margin-bottom: 20px;
    }
    
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #fff;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    
    .header .subtitle {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 5px;
      font-weight: 500;
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
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 20px;
      text-transform: uppercase;
      color: #667eea;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
      letter-spacing: 1px;
    }
    
    .party {
      margin-bottom: 25px;
      padding: 20px;
      background: linear-gradient(to right, #f8f9ff 0%, #fff 100%);
      border-left: 5px solid #667eea;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .party-title {
      font-weight: 700;
      margin-bottom: 15px;
      font-size: 18px;
      color: #667eea;
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
      margin-bottom: 25px;
      padding: 20px;
      border: 2px solid #e8ebf7;
      background: #fafbff;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .article:hover {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    }
    
    .article-title {
      font-weight: 700;
      margin-bottom: 12px;
      font-size: 17px;
      color: #764ba2;
    }
    
    .article-content {
      text-align: justify;
      line-height: 1.9;
      color: #4a4a4a;
    }
    
    .signature-section {
      margin-top: 80px;
      display: flex;
      justify-content: space-between;
      gap: 20px;
      page-break-inside: avoid;
    }
    
    .signature-box {
      flex: 1;
      text-align: center;
      padding: 25px;
      background: #f8f9ff;
      border-radius: 8px;
      border: 2px dashed #667eea;
    }
    
    .signature-box > div:first-child {
      font-weight: 600;
      color: #667eea;
      margin-bottom: 10px;
    }
    
    .signature-image {
      max-width: 200px;
      max-height: 100px;
      margin: 20px auto;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
    }
    
    .signature-line {
      border-top: 3px solid #667eea;
      margin-top: 20px;
      padding-top: 15px;
      font-weight: 700;
      color: #1a1a1a;
    }
    
    .signature-info {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
    
    .footer {
      margin-top: 60px;
      text-align: center;
      font-size: 13px;
      color: #888;
      border-top: 2px solid #e8ebf7;
      padding-top: 30px;
      background: linear-gradient(to bottom, transparent 0%, #f8f9ff 100%);
      padding-bottom: 20px;
      border-radius: 8px;
    }
    
    .footer strong {
      color: #667eea;
      font-weight: 600;
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
    <img src="${logoUrl}" alt="Immo Link Sénégal" class="logo" onerror="this.style.display='none'">
    <h1>${title}</h1>
    <div class="subtitle">Immo Link Sénégal - Plateforme Immobilière de Référence</div>
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
      ${ownerSignature ? `
        <img src="${ownerSignature.signature_data}" alt="Signature" class="signature-image" />
        <div class="signature-info">Signé le ${new Date(ownerSignature.signed_at).toLocaleDateString('fr-FR')}</div>
      ` : '<div class="signature-line">_________________</div>'}
      <div class="signature-line">${contract.owner_name}</div>
    </div>
    
    ${!isMandat && contract.tenant_name ? `
    <div class="signature-box">
      <div>Le Locataire</div>
      ${tenantSignature ? `
        <img src="${tenantSignature.signature_data}" alt="Signature" class="signature-image" />
        <div class="signature-info">Signé le ${new Date(tenantSignature.signed_at).toLocaleDateString('fr-FR')}</div>
      ` : '<div class="signature-line">_________________</div>'}
      <div class="signature-line">${contract.tenant_name}</div>
    </div>
    ` : ''}
    
    <div class="signature-box">
      <div>${isMandat ? 'Le Mandataire' : "L'Agence"}</div>
      ${agencySignature ? `
        <img src="${agencySignature.signature_data}" alt="Signature" class="signature-image" />
        <div class="signature-info">Signé le ${new Date(agencySignature.signed_at).toLocaleDateString('fr-FR')}</div>
      ` : '<div class="signature-line">_________________</div>'}
      <div class="signature-line">Immo Link Sénégal</div>
    </div>
  </div>

  <div class="footer">
    <strong>Immo Link Sénégal</strong> - Plateforme de gestion immobilière professionnelle
    <br/>
    📍 Dakar, Sénégal | 📧 contact@immolink.sn | 🌐 www.immolink.sn
    <br/>
    <small style="color: #aaa; margin-top: 10px; display: block;">Document généré le ${currentDate}</small>
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