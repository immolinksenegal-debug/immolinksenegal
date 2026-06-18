import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
const Privacy = () => {
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-8 py-[35px] px-[150px]">
            Politique de confidentialité
          </h1>

          <div className="glass-effect rounded-2xl p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">1. Collecte des informations</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Immo Link Sénégal collecte différentes informations lorsque vous utilisez notre plateforme :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Informations d'identification (nom, email, téléphone)</li>
                <li>Informations sur les biens immobiliers</li>
                <li>Données de navigation et d'utilisation du site</li>
                <li>Photos et documents liés aux annonces</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">2. Utilisation des informations</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Vos informations sont utilisées pour :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Faciliter les transactions immobilières</li>
                <li>Améliorer nos services</li>
                <li>Vous contacter concernant votre compte ou vos annonces</li>
                <li>Personnaliser votre expérience utilisateur</li>
                <li>Assurer la sécurité de la plateforme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">3. Protection des données</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles contre 
                tout accès non autorisé, modification, divulgation ou destruction. Vos données sont stockées sur des serveurs 
                sécurisés et nous utilisons des protocoles de cryptage pour les transactions sensibles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">4. Partage des informations</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous ne vendons ni ne louons vos informations personnelles à des tiers. Vos informations peuvent être partagées 
                uniquement dans les cas suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-4">
                <li>Avec votre consentement explicite</li>
                <li>Pour faciliter les transactions immobilières entre utilisateurs</li>
                <li>Pour se conformer à des obligations légales</li>
                <li>Avec nos prestataires de services qui nous aident à exploiter la plateforme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">5. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Notre site utilise des cookies pour améliorer votre expérience de navigation. Les cookies sont de petits fichiers 
                texte stockés sur votre appareil qui nous permettent de reconnaître votre navigateur et de mémoriser certaines informations. 
                Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut limiter certaines fonctionnalités du site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">6. Vos droits</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Vous disposez des droits suivants concernant vos données personnelles :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification de vos données</li>
                <li>Droit de suppression de vos données</li>
                <li>Droit d'opposition au traitement de vos données</li>
                <li>Droit à la portabilité de vos données</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">7. Conservation des données</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous conservons vos informations personnelles aussi longtemps que nécessaire pour fournir nos services et 
                respecter nos obligations légales. Lorsque vous supprimez votre compte, nous supprimons ou anonymisons vos 
                données personnelles dans un délai raisonnable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">8. Modifications de la politique</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous pouvons modifier cette politique de confidentialité de temps en temps. Nous vous informerons de tout 
                changement significatif en publiant la nouvelle politique sur cette page et en mettant à jour la date de 
                "dernière mise à jour".
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">9. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
                contactez-nous à immolinksenegal@gmail.com ou au +221 77 117 79 77.
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
export default Privacy;