
export default function Legal() {
  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Mentions Légales</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Informations légales</h2>
          <p className="mb-2">
            Le site FitCoach est édité par la société FitCoach SAS, au capital de 10 000€, immatriculée au RCS de Paris sous le numéro 123 456 789.
          </p>
          <p className="mb-2">
            <strong>Siège social :</strong> 123 Rue du Sport, 75001 Paris, France<br />
            <strong>Numéro de téléphone :</strong> +33 1 23 45 67 89<br />
            <strong>Email :</strong> contact@fitcoach.com<br />
            <strong>Directeur de la publication :</strong> John Doe
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">2. Hébergement</h2>
          <p className="mb-2">
            Le site est hébergé par la société Vercel Inc., située à San Francisco, CA, USA.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">3. Propriété intellectuelle</h2>
          <p className="mb-2">
            L'ensemble du contenu du site FitCoach (textes, graphismes, logos, images, vidéos, etc.) est la propriété exclusive de FitCoach SAS ou fait l'objet d'une autorisation d'utilisation. Toute reproduction ou représentation totale ou partielle de ce site par quelque procédé que ce soit, sans l'autorisation expresse de FitCoach SAS, est interdite et constituerait une contrefaçon.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">4. Protection des données personnelles</h2>
          <p className="mb-2">
            Conformément au Règlement Général sur la Protection des Données (RGPD), les utilisateurs disposent d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles les concernant. Pour exercer ces droits, contactez-nous à l'adresse : privacy@fitcoach.com.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">5. Cookies</h2>
          <p className="mb-2">
            Le site FitCoach utilise des cookies pour améliorer l'expérience utilisateur. En naviguant sur notre site, vous acceptez l'utilisation de ces cookies. Vous pouvez à tout moment désactiver les cookies dans les paramètres de votre navigateur.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">6. Limitation de responsabilité</h2>
          <p className="mb-2">
            FitCoach SAS ne pourra être tenue responsable des dommages directs ou indirects résultant de l'utilisation de son site web ou des sites liés à celui-ci. Les informations fournies sur le site sont présentées à titre indicatif et général sans garantie d'exactitude, d'exhaustivité ou d'actualité.
          </p>
        </section>
      </div>
    </div>
  );
}
