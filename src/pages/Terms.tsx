import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
const Terms = () => {
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-8 px-[100px] mx-[100px] py-[20px]">
            Conditions d'utilisation
          </h1>

          <div className="glass-effect rounded-2xl p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">1. Acceptation des conditions</h2>
              <p className="text-muted-foreground leading-relaxed">
                En accédant et en utilisant la plateforme Immo Link Sénégal, vous acceptez d'être lié par ces conditions d'utilisation. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">2. Utilisation du service</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Notre plateforme est destinée à faciliter les transactions immobilières au Sénégal. Vous vous engagez à :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Fournir des informations exactes et véridiques</li>
                <li>Maintenir la sécurité de votre compte</li>
                <li>Ne pas publier de contenu frauduleux ou trompeur</li>
                <li>Respecter les droits de propriété intellectuelle</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">3. Publication d'annonces</h2>
              <p className="text-muted-foreground leading-relaxed">
                Les utilisateurs qui publient des annonces s'engagent à fournir des informations exactes concernant leurs biens. 
                Immo Link Sénégal se réserve le droit de supprimer toute annonce ne respectant pas nos standards de qualité.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">4. Responsabilités</h2>
              <p className="text-muted-foreground leading-relaxed">
                Immo Link Sénégal agit comme intermédiaire entre acheteurs et vendeurs. Nous ne sommes pas responsables des transactions 
                effectuées entre utilisateurs. Chaque partie est responsable de la vérification des informations et de la légalité de ses transactions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">5. Propriété intellectuelle</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tout le contenu présent sur Immo Link Sénégal, incluant le design, les logos, et les textes, est protégé par les lois 
                sur la propriété intellectuelle et appartient à Immo Link Sénégal ou à ses partenaires.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">6. Modifications des conditions</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications seront effectives dès leur 
                publication sur le site. Votre utilisation continue du service après ces modifications constitue votre acceptation des nouvelles conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">7. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter à immolinksenegal@gmail.com
              </p>
            </section>
          </div>

          <p className="text-sm text-muted-foreground mt-8 text-center">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </main>

      <Footer />
    </div>;
};
export default Terms;