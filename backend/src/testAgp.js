/**
 * Test Script pour AGP SDK
 *
 * Ce script teste le SDK AGP en exécutant une tâche simple.
 * Pour lancer ce script: node src/testAgp.js
 */

import dotenv from 'dotenv';
import { WebAgent } from '@h-company/agp-sdk-js';

// Charger les variables d'environnement
dotenv.config();

(async () => {
  console.log('🧪 Test du SDK AGP - Démarrage...\n');

  // Vérifier que la clé API est présente
  if (!process.env.AGP_API_KEY || process.env.AGP_API_KEY === 'your_agp_api_key_here') {
    console.error('❌ Erreur: AGP_API_KEY n\'est pas configurée dans le fichier .env');
    console.log('\n📝 Instructions:');
    console.log('   1. Visitez Portal-H pour générer une clé API');
    console.log('   2. Ajoutez la clé dans backend/.env:');
    console.log('      AGP_API_KEY=votre_cle_api_ici\n');
    process.exit(1);
  }

  try {
    // Initialiser l'agent avec la clé API
    console.log('🔑 Authentification avec AGP...');
    const agent = WebAgent.fromApiKey(process.env.AGP_API_KEY, {
      debug: true // Active les logs de debug
    });
    console.log('✅ Agent initialisé avec succès!\n');

    // Créer et exécuter une tâche de test
    console.log('🚀 Lancement de la tâche de test...');
    console.log('📋 Objectif: Rechercher des écouteurs anti-bruit et résumer les 3 meilleurs résultats\n');

    const task = await agent.run(
      'Search for noise-cancelling headphones and summarize the top 3 results.',
      { startUrl: 'https://google.com' }
    );

    console.log(`✅ Tâche créée avec l'ID: ${task.id}\n`);

    // Écouter les événements de la tâche
    console.log('👂 Écoute des événements en temps réel...\n');

    task.onUpdate((event) => {
      console.log(`📡 [${event.type}]`, event.data);
    });

    task.onStatusChange((status) => {
      console.log(`🔄 Changement de statut: ${status}`);
    });

    task.onChatMessage((message) => {
      console.log(`💬 Message: ${message.data.content}`);
    });

    task.onWebAction((action) => {
      console.log(`🌐 Action web: ${action.data.action.action_type}`);
    });

    task.onError((error) => {
      console.error(`❌ Erreur de la tâche:`, error);
    });

    // Attendre la complétion
    console.log('⏳ Attente de la complétion de la tâche...\n');
    await task.waitForCompletion();

    console.log('\n✅ Tâche terminée avec succès!');
    console.log('🎉 Test du SDK AGP réussi!\n');

    console.log('📊 Pour voir les résultats détaillés:');
    console.log('   - Visitez Surfer-H');
    console.log('   - Ou consultez les logs ci-dessus\n');

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    console.error('Stack trace:', error);
    process.exit(1);
  }
})();
