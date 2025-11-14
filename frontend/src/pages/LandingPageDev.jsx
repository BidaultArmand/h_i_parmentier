import React from 'react';

/**
 * PAGE DE DÉVELOPPEMENT POUR L'ÉQUIPE FRONTEND - LANDING PAGE
 *
 * Cette page est une zone de travail vide pour développer la nouvelle landing page.
 * Le Header avec le système de connexion est déjà intégré automatiquement via App.jsx.
 *
 * INSTRUCTIONS POUR L'ÉQUIPE:
 * 1. Développez votre contenu dans la section <main> ci-dessous
 * 2. Utilisez Tailwind CSS pour le styling (déjà configuré)
 * 3. Les couleurs du projet sont définies dans tailwind.config.js:
 *    - Primary: #157C6B (vert teal)
 *    - Secondary: #B2E3C2 (vert clair)
 *    - Accent colors: voir tailwind.config.js
 * 4. Vous pouvez importer des composants depuis /components si besoin
 * 5. Pour tester: npm run dev depuis /frontend
 *
 * REMARQUES:
 * - Le Header est déjà présent en haut (navigation + connexion)
 * - L'utilisateur connecté sera disponible via useAuth() si besoin
 * - Cette page est accessible à l'URL: /landing-dev
 */

const LandingPageDev = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/*
        ZONE DE DÉVELOPPEMENT - COMMENCEZ ICI
        ====================================

        Le Header avec connexion utilisateur est déjà en place (dans App.jsx)
        Développez votre landing page ci-dessous
      */}

      <main className="container mx-auto px-4 py-12">
        {/* Section Hero - Exemple de structure */}
        <section className="mb-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Votre Landing Page - En Développement
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cette zone est prête pour votre équipe frontend.
              Le header avec connexion utilisateur est déjà intégré.
            </p>
          </div>
        </section>

        {/* Espace de travail libre */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Zone de travail
          </h2>
          <p className="text-gray-600 mb-4">
            Développez votre contenu ici. Quelques ressources utiles:
          </p>

          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Composants UI disponibles dans: <code className="bg-gray-100 px-2 py-1 rounded">/frontend/src/components/ui/</code></li>
            <li>Icons Lucide React: <code className="bg-gray-100 px-2 py-1 rounded">import &#123; IconName &#125; from 'lucide-react'</code></li>
            <li>Tailwind CSS configuré avec les couleurs du projet</li>
            <li>Routing avec React Router v6</li>
          </ul>
        </section>

        {/* Section exemple avec la palette de couleurs */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Palette de couleurs du projet
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-full h-20 bg-accent-green rounded-lg mb-2"></div>
              <p className="text-sm text-gray-600">Primary<br/>(bg-accent-green)</p>
            </div>
            <div className="text-center">
              <div className="w-full h-20 bg-accent-light-green rounded-lg mb-2"></div>
              <p className="text-sm text-gray-600">Secondary<br/>(bg-accent-light-green)</p>
            </div>
            <div className="text-center">
              <div className="w-full h-20 bg-accent-red rounded-lg mb-2"></div>
              <p className="text-sm text-gray-600">Accent Red<br/>(bg-accent-red)</p>
            </div>
            <div className="text-center">
              <div className="w-full h-20 bg-accent-pink rounded-lg mb-2"></div>
              <p className="text-sm text-gray-600">Accent Pink<br/>(bg-accent-pink)</p>
            </div>
          </div>
        </section>

        {/*
          AJOUTEZ VOS SECTIONS ICI
          ========================
        */}

      </main>
    </div>
  );
};

export default LandingPageDev;
