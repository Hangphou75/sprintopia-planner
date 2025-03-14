
export default function Pricing() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Tarifs</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Pack Bronze</h2>
          <p className="text-3xl font-bold mb-4">29€ <span className="text-sm font-normal">/mois</span></p>
          <ul className="space-y-2 mb-6">
            <li>Accès à la plateforme</li>
            <li>1 programme personnalisé</li>
            <li>Support par email</li>
          </ul>
          <button className="w-full bg-primary text-white py-2 rounded-md">Souscrire</button>
        </div>
        
        <div className="border rounded-lg p-6 shadow-sm border-primary">
          <div className="bg-primary text-white px-3 py-1 rounded-full text-xs inline-block mb-2">Populaire</div>
          <h2 className="text-xl font-semibold mb-2">Pack Silver</h2>
          <p className="text-3xl font-bold mb-4">49€ <span className="text-sm font-normal">/mois</span></p>
          <ul className="space-y-2 mb-6">
            <li>Accès à la plateforme</li>
            <li>3 programmes personnalisés</li>
            <li>Support par email et chat</li>
            <li>Analyses de performances</li>
          </ul>
          <button className="w-full bg-primary text-white py-2 rounded-md">Souscrire</button>
        </div>
        
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Pack Gold</h2>
          <p className="text-3xl font-bold mb-4">89€ <span className="text-sm font-normal">/mois</span></p>
          <ul className="space-y-2 mb-6">
            <li>Accès à la plateforme</li>
            <li>Programmes illimités</li>
            <li>Support prioritaire</li>
            <li>Analyses avancées</li>
            <li>Consultation vidéo mensuelle</li>
          </ul>
          <button className="w-full bg-primary text-white py-2 rounded-md">Souscrire</button>
        </div>
      </div>
    </div>
  );
}
