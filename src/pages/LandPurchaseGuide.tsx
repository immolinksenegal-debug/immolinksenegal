import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileCheck2, Landmark, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SITE_URL = "https://immolinksenegal.lovable.app";
const publishedDate = "2026-06-18T00:00:00+00:00";

const verificationSteps = [
  "Identifier clairement le vendeur et vérifier sa capacité légale à céder le terrain.",
  "Contrôler la nature du droit détenu : Titre Foncier, bail, délibération, permis d'occuper ou attribution.",
  "Demander les documents originaux et comparer les références cadastrales avec la parcelle visitée.",
  "Consulter les services compétents, la conservation foncière ou un notaire avant tout paiement important.",
  "Formaliser la vente par acte écrit, enregistré, puis suivre la mutation ou la régularisation administrative.",
];

const LandPurchaseGuide = () => {
  return (
    <div className="min-h-screen">
      <SEOHead
        title="Guide complet : Comment acheter un terrain au Sénégal en toute sécurité"
        description="Étapes légales pour acheter un terrain au Sénégal : Titre Foncier, bail, vérifications cadastrales, notaire et sécurisation de l'achat."
        url={`${SITE_URL}/articles/guide-achat-terrain-senegal`}
        type="article"
        schemaType="article"
        publishedTime={publishedDate}
        modifiedTime={publishedDate}
      />
      <Navbar />
      <main className="pt-24 pb-16">
        <article className="container mx-auto max-w-4xl px-4">
          <Link to="/articles" className="mb-8 inline-flex items-center gap-2 text-muted-foreground transition-base hover:text-secondary">
            <ArrowLeft className="h-4 w-4" />
            Retour aux articles
          </Link>

          <header className="mb-10 border-b border-border pb-8">
            <Badge className="mb-4 bg-accent text-accent-foreground border-0">Guide immobilier</Badge>
            <h1 className="mb-5 text-4xl font-bold leading-tight md:text-5xl">
              Guide complet : Comment acheter un terrain au Sénégal en toute sécurité
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              Acheter un terrain au Sénégal peut être une excellente décision patrimoniale, mais la sécurité juridique dépend d'une méthode stricte : vérifier le titre, confirmer l'identité du vendeur, contrôler la parcelle et formaliser chaque paiement.
            </p>
          </header>

          <section className="mb-10 grid gap-4 md:grid-cols-3">
            <div className="border border-border bg-card p-5 shadow-card">
              <ShieldCheck className="mb-3 h-7 w-7 text-secondary" />
              <h2 className="mb-2 text-lg font-semibold">Sécuriser</h2>
              <p className="text-sm leading-6 text-muted-foreground">Ne jamais acheter uniquement sur promesse verbale, plan informel ou copie non vérifiée.</p>
            </div>
            <div className="border border-border bg-card p-5 shadow-card">
              <Landmark className="mb-3 h-7 w-7 text-secondary" />
              <h2 className="mb-2 text-lg font-semibold">Vérifier</h2>
              <p className="text-sm leading-6 text-muted-foreground">Confirmer le statut foncier auprès des services compétents ou avec un notaire.</p>
            </div>
            <div className="border border-border bg-card p-5 shadow-card">
              <FileCheck2 className="mb-3 h-7 w-7 text-secondary" />
              <h2 className="mb-2 text-lg font-semibold">Formaliser</h2>
              <p className="text-sm leading-6 text-muted-foreground">Signer un acte clair, enregistrer la transaction et suivre la mutation du droit.</p>
            </div>
          </section>

          <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
            <h2>1. Comprendre les principaux statuts fonciers</h2>
            <p>
              Le premier réflexe consiste à savoir ce que le vendeur possède réellement. Un <strong>Titre Foncier</strong> offre généralement le niveau de sécurité le plus élevé, car il identifie précisément le propriétaire et la parcelle. Un <strong>bail</strong> donne un droit d'occupation ou d'exploitation sur une durée déterminée, souvent renouvelable selon les conditions prévues. Les délibérations, permis d'occuper ou attestations d'attribution peuvent exister dans certains dossiers, mais ils nécessitent une vérification renforcée avant toute avance.
            </p>

            <h2>2. Vérifier le vendeur et l'origine du terrain</h2>
            <p>
              Demandez une pièce d'identité, les documents fonciers, les références cadastrales, le plan de localisation et l'historique de propriété. Si le vendeur agit pour une famille, une société ou un héritage, exigez les procurations, statuts, procès-verbaux ou actes de succession nécessaires. Cette étape évite les ventes multiples, les indivisions non réglées et les conflits familiaux.
            </p>

            <h2>3. Contrôler la parcelle sur place</h2>
            <p>
              Une visite ne suffit pas : comparez la localisation réelle avec les documents. Faites confirmer les limites, l'accès, la viabilisation, les servitudes éventuelles et la compatibilité du projet avec la zone. Pour un terrain à vendre à Dakar, sur la Petite Côte ou dans une zone en forte croissance, la pression foncière rend ces vérifications encore plus importantes.
            </p>

            <h2>4. Passer par un professionnel avant le paiement</h2>
            <p>
              Avant de verser une somme significative, consultez un notaire, un conseil juridique ou un professionnel immobilier sérieux. Le professionnel peut vérifier la chaîne documentaire, préparer l'acte, sécuriser les conditions de paiement et vous alerter si le terrain n'est pas immédiatement cessible.
            </p>

            <h2>5. Signer, enregistrer et suivre la mutation</h2>
            <p>
              L'acte de vente doit mentionner le prix, l'identité des parties, les références du terrain, les modalités de paiement et les obligations de chacun. Après signature, l'enregistrement et les démarches de mutation ou de régularisation doivent être suivis jusqu'à obtention des documents mis à jour. Gardez toutes les preuves de paiement et évitez les règlements en espèces non documentés.
            </p>

            <h2>Checklist avant d'acheter un terrain au Sénégal</h2>
            <ul>
              {verificationSteps.map((step) => (
                <li key={step} className="my-2 flex gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-secondary" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>

            <h2>Conclusion</h2>
            <p>
              Un bon achat de terrain au Sénégal repose sur une règle simple : ne pas confondre opportunité et précipitation. Plus le prix paraît attractif, plus la vérification doit être rigoureuse. En cas de doute, faites contrôler le dossier avant de signer.
            </p>
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Link to="/contact">Demander un accompagnement</Link>
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default LandPurchaseGuide;