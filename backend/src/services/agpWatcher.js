/**
 * AGP Watcher Service
 *
 * Surveille le fichier product_to_search.json et lance automatiquement
 * une recherche AGP dès qu'il est modifié.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchProductsAutomatically } from '../controllers/agpController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers le fichier à surveiller
const JSON_FILE_PATH = path.join(__dirname, '../../data/product_to_search.json');

// Variables pour éviter les déclenchements multiples
let isProcessing = false;
let lastModified = null;
let debounceTimer = null;

/**
 * Démarre la surveillance du fichier JSON
 */
export const startWatching = () => {
  console.log('👁️  Démarrage de la surveillance du fichier product_to_search.json...');
  console.log(`📂 Chemin surveillé: ${JSON_FILE_PATH}`);

  // Vérifier que le fichier existe
  if (!fs.existsSync(JSON_FILE_PATH)) {
    console.warn('⚠️  Le fichier product_to_search.json n\'existe pas encore.');
    console.log('   Il sera créé et surveillé dès sa première apparition.');
  }

  // Surveiller le fichier et son dossier parent
  const watchDir = path.dirname(JSON_FILE_PATH);

  const watcher = fs.watch(watchDir, { persistent: true }, (eventType, filename) => {
    // On s'intéresse uniquement au fichier product_to_search.json
    if (filename !== 'product_to_search.json') {
      return;
    }

    console.log(`\n🔔 Événement détecté: ${eventType} sur ${filename}`);

    // Vérifier que le fichier existe toujours
    if (!fs.existsSync(JSON_FILE_PATH)) {
      console.log('⚠️  Le fichier a été supprimé, en attente de recréation...');
      return;
    }

    // Obtenir la date de modification
    const stats = fs.statSync(JSON_FILE_PATH);
    const currentModified = stats.mtime.getTime();

    // Éviter les déclenchements multiples pour la même modification
    if (lastModified === currentModified) {
      return;
    }

    lastModified = currentModified;

    // Debounce : attendre 1 seconde pour s'assurer que le fichier est complètement écrit
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      handleFileChange();
    }, 1000);
  });

  watcher.on('error', (error) => {
    console.error('❌ Erreur du watcher:', error);
  });

  console.log('✅ Surveillance active! Le système détectera automatiquement les modifications.\n');

  return watcher;
};

/**
 * Gère le changement du fichier JSON
 */
const handleFileChange = async () => {
  if (isProcessing) {
    console.log('⏸️  Une recherche est déjà en cours, modification ignorée.');
    return;
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 DÉCLENCHEMENT AUTOMATIQUE DE LA RECHERCHE AGP');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);
  console.log(`📂 Fichier: ${JSON_FILE_PATH}`);
  console.log('───────────────────────────────────────────────────────────────\n');

  try {
    // Lire et valider le fichier JSON
    const jsonContent = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(jsonContent);

    // Vérifier la structure
    if (!jsonData.recipes || !Array.isArray(jsonData.recipes)) {
      console.error('❌ Structure JSON invalide: "recipes" array manquant');
      return;
    }

    if (jsonData.recipes.length === 0) {
      console.log('⚠️  Aucune recette trouvée dans le JSON, recherche annulée.');
      return;
    }

    // Compter les ingrédients
    let totalIngredients = 0;
    jsonData.recipes.forEach(recipe => {
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        totalIngredients += recipe.ingredients.length;
      }
    });

    console.log(`📋 ${jsonData.recipes.length} recette(s) détectée(s)`);
    console.log(`🛒 ${totalIngredients} ingrédient(s) à rechercher\n`);

    if (totalIngredients === 0) {
      console.log('⚠️  Aucun ingrédient trouvé, recherche annulée.');
      return;
    }

    // Marquer comme en cours
    isProcessing = true;

    // Lancer la recherche automatique
    console.log('🔍 Lancement de la recherche sur La Vie Claire...\n');

    const result = await searchProductsAutomatically();

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ RECHERCHE AUTOMATIQUE TERMINÉE');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📊 Résultats: ${result.totalIngredients} produit(s) recherché(s)`);
    console.log(`💾 Fichiers sauvegardés dans: backend/data/agpresp/`);
    console.log(`📁 Fichier global: ${path.basename(result.savedFiles.globalFile)}`);
    console.log('───────────────────────────────────────────────────────────────\n');

  } catch (error) {
    console.error('\n❌ ERREUR lors de la recherche automatique:');
    console.error(error.message);
    console.error(error.stack);
    console.log('───────────────────────────────────────────────────────────────\n');
  } finally {
    // Libérer le verrou
    isProcessing = false;
  }
};

/**
 * Arrête la surveillance
 */
export const stopWatching = (watcher) => {
  if (watcher) {
    watcher.close();
    console.log('🛑 Surveillance arrêtée.');
  }
};
