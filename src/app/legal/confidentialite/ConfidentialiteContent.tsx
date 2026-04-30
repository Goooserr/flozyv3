import React from 'react';

export default function ConfidentialiteContent() {
  return (
    <article className="prose prose-invert prose-zinc max-w-none">
      <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Politique de Confidentialité</h1>
      
      <p className="text-zinc-400 text-lg mb-12">
        Mise à jour le : {new Date().toLocaleDateString('fr-FR')}
      </p>

      <section className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-white border-l-2 border-primary pl-4">1. Responsable du traitement</h2>
        <p className="text-zinc-400 leading-relaxed">
          Le responsable du traitement des données est [NOM DE L'ENTREPRISE / VOTRE NOM], situé au [VOTRE ADRESSE].
        </p>
      </section>

      <section className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-white border-l-2 border-primary pl-4">2. Données collectées</h2>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 text-zinc-300">
          <p className="mb-4">Nous collectons les données suivantes :</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Identité :</strong> Nom, prénom, nom de l'entreprise.</li>
            <li><strong>Contact :</strong> Email, numéro de téléphone, adresse postale.</li>
            <li><strong>Données métier :</strong> Informations sur vos clients, devis, factures, photos de chantiers.</li>
            <li><strong>Données techniques :</strong> Adresse IP, cookies de session.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-white border-l-2 border-primary pl-4">3. Finalité de la collecte</h2>
        <p className="text-zinc-400 leading-relaxed">
          Vos données sont collectées pour permettre le fonctionnement du service Flozy, la gestion de vos facturations, le support client et l'amélioration continue de l'outil.
          <strong> Vos données ne sont jamais revendues à des tiers.</strong>
        </p>
      </section>

      <section className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-white border-l-2 border-primary pl-4">4. Sous-traitants (Tiers)</h2>
        <p className="text-zinc-400 leading-relaxed">
          Nous faisons appel à des prestataires de confiance pour le fonctionnement du service :
        </p>
        <ul className="list-disc pl-10 text-zinc-400 space-y-2">
          <li><strong>Supabase :</strong> Stockage des données et authentification.</li>
          <li><strong>Stripe :</strong> Traitement des paiements sécurisés.</li>
          <li><strong>Resend / Postmark :</strong> Envoi des emails transactionnels.</li>
        </ul>
      </section>

      <section className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-white border-l-2 border-primary pl-4">5. Vos droits (RGPD)</h2>
        <p className="text-zinc-400 leading-relaxed">
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. 
          Vous pouvez exercer ces droits en nous contactant à : <span className="text-primary">contact@flozy.fr</span>.
        </p>
      </section>

      <section className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-white border-l-2 border-primary pl-4">6. Cookies</h2>
        <p className="text-zinc-400 leading-relaxed">
          Flozy utilise uniquement des cookies techniques nécessaires au fonctionnement du service (maintien de la connexion, sécurité). Nous n'utilisons pas de cookies de traçage publicitaire tiers.
        </p>
      </section>

      <div className="mt-20 p-8 rounded-[2rem] bg-primary/5 border border-primary/20">
        <p className="text-sm text-zinc-300 italic">
          <strong>Rappel :</strong> Cette politique doit être adaptée si vous installez des outils tiers comme Google Analytics ou Facebook Pixel.
        </p>
      </div>
    </article>
  );
}
