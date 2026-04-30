import React from 'react';

export default function CGVContent() {
  return (
    <article className="prose prose-invert prose-zinc max-w-none">
      <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Conditions Générales de Vente</h1>
      
      <p className="text-zinc-400 text-lg mb-12">
        Applicables au : {new Date().toLocaleDateString('fr-FR')}
      </p>

      <section className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-white border-l-2 border-primary pl-4">1. Objet</h2>
        <p className="text-zinc-400 leading-relaxed">
          Les présentes Conditions Générales de Vente (CGV) régissent l'utilisation du service Flozy, un logiciel de gestion (SaaS) destiné aux artisans et entreprises du bâtiment. 
          Toute souscription à un abonnement implique l'acceptation sans réserve des présentes conditions.
        </p>
      </section>

      <section className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-white border-l-2 border-primary pl-4">2. Services fournis</h2>
        <p className="text-zinc-400 leading-relaxed">
          Flozy fournit des outils de création de devis, factures, gestion de clients, planning et stock. 
          Les fonctionnalités varient selon le plan d'abonnement choisi (Starter, Pro, Expert) tel que décrit sur le site lors de la souscription.
        </p>
      </section>

      <section className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-white border-l-2 border-primary pl-4">3. Tarification et Paiement</h2>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 text-zinc-300 space-y-4">
          <p>Les prix sont indiqués en Euros HT. La TVA applicable est celle en vigueur au jour de la facturation.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Abonnement mensuel :</strong> Prélevé chaque mois à la date anniversaire.</li>
            <li><strong>Paiement :</strong> S'effectue par carte bancaire via le prestataire sécurisé Stripe.</li>
            <li><strong>Défaut de paiement :</strong> Entraîne la suspension de l'accès aux services après 3 tentatives infructueuses.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-white border-l-2 border-primary pl-4">4. Durée et Résiliation</h2>
        <p className="text-zinc-400 leading-relaxed">
          Les abonnements sont sans engagement de durée. L'utilisateur peut résilier son abonnement à tout moment depuis son espace "Paramètres". 
          Toute période entamée est due et aucun remboursement ne sera effectué pour le mois en cours.
        </p>
      </section>

      <section className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-white border-l-2 border-primary pl-4">5. Responsabilité</h2>
        <p className="text-zinc-400 leading-relaxed">
          Flozy met tout en œuvre pour assurer une disponibilité du service de 99.9%. 
          Toutefois, l'éditeur ne saurait être tenu pour responsable en cas d'interruption temporaire pour maintenance ou en cas de perte de données imputable à l'utilisateur.
        </p>
      </section>

      <section className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-white border-l-2 border-primary pl-4">6. Droit applicable</h2>
        <p className="text-zinc-400 leading-relaxed">
          Les présentes CGV sont soumises au droit français. En cas de litige, compétence exclusive est attribuée aux tribunaux du siège social de l'éditeur.
        </p>
      </section>

      <div className="mt-20 p-8 rounded-[2rem] bg-primary/5 border border-primary/20">
        <p className="text-sm text-zinc-300 italic">
          <strong>Important :</strong> Ce document est un modèle simplifié. Un SaaS B2B nécessite souvent des clauses spécifiques sur la réversibilité des données et les SLAs. Il est recommandé de le faire valider juridiquement.
        </p>
      </div>
    </article>
  );
}
