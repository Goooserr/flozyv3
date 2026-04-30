import React from 'react';

export default function MentionsLegalesContent() {
  return (
    <article className="prose prose-invert prose-zinc max-w-none">
      <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Mentions Légales</h1>
      
      <p className="text-zinc-400 text-lg mb-12">
        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
      </p>

      <section className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-white border-l-2 border-primary pl-4">1. Éditeur du site</h2>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 text-zinc-300 space-y-2">
          <p><strong>Dénomination sociale :</strong> [NOM DE VOTRE ENTREPRISE OU NOM PROPRE]</p>
          <p><strong>Forme juridique :</strong> [EX: SAS, Auto-entrepreneur, etc.]</p>
          <p><strong>Siège social :</strong> [VOTRE ADRESSE COMPLÈTE]</p>
          <p><strong>SIRET :</strong> [VOTRE NUMÉRO SIRET]</p>
          <p><strong>Directeur de la publication :</strong> [NOM DU RESPONSABLE]</p>
          <p><strong>Email :</strong> contact@flozy.fr</p>
        </div>
      </section>

      <section className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-white border-l-2 border-primary pl-4">2. Hébergement</h2>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 text-zinc-300 space-y-2">
          <p>Le site Flozy est hébergé par :</p>
          <p><strong>Hébergeur :</strong> [Vercel Inc. / Railway / etc.]</p>
          <p><strong>Adresse :</strong> [Adresse de l'hébergeur]</p>
          <p><strong>Site web :</strong> [URL de l'hébergeur]</p>
        </div>
      </section>

      <section className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-white border-l-2 border-primary pl-4">3. Propriété intellectuelle</h2>
        <p className="text-zinc-400 leading-relaxed">
          L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
          Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
        </p>
      </section>

      <section className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-white border-l-2 border-primary pl-4">4. Données personnelles</h2>
        <p className="text-zinc-400 leading-relaxed">
          Pour toute information concernant le traitement des données personnelles, veuillez consulter notre 
          <a href="/legal/confidentialite" className="text-primary hover:underline ml-1">Politique de Confidentialité</a>.
        </p>
      </section>

      <div className="mt-20 p-8 rounded-[2rem] bg-primary/5 border border-primary/20">
        <p className="text-sm text-zinc-300 italic">
          <strong>Note :</strong> Ces mentions légales sont fournies à titre de modèle. Elles doivent être complétées et vérifiées par un professionnel du droit pour garantir leur conformité totale avec votre situation spécifique.
        </p>
      </div>
    </article>
  );
}
