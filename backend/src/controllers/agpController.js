/**
 * AGP Controller
 *
 * Gère les requêtes liées au SDK AGP (Agent Platform)
 */

import { WebAgent } from '@h-company/agp-sdk-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Pour obtenir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialise un agent AGP
 */
const initializeAgent = () => {
  if (!process.env.AGP_API_KEY || process.env.AGP_API_KEY === 'your_agp_api_key_here') {
    throw new Error('AGP_API_KEY is not configured. Please add it to the .env file.');
  }

  return WebAgent.fromApiKey(process.env.AGP_API_KEY, {
    debug: true
  });
};

/**
 * POST /api/agp/test
 * Test simple du SDK AGP
 */
export const testAgp = async (req, res) => {
  try {
    console.log('🧪 Test AGP - Démarrage...');

    const agent = initializeAgent();
    console.log('✅ Agent initialisé');

    const task = await agent.run(
      'Search for noise-cancelling headphones and summarize the top 3 results.',
      { startUrl: 'https://google.com' }
    );

    console.log(`✅ Tâche créée: ${task.id}`);

    // Collecter les événements pour la réponse
    const events = [];

    task.onUpdate((event) => {
      console.log(`📡 [${event.type}]`, event.data);
      events.push({
        type: event.type,
        timestamp: new Date().toISOString(),
        data: event.data
      });
    });

    task.onStatusChange((status) => {
      console.log(`🔄 Statut: ${status}`);
    });

    task.onError((error) => {
      console.error(`❌ Erreur:`, error);
    });

    // Attendre la complétion (avec timeout)
    await task.waitForCompletion();

    console.log('✅ Tâche terminée!');

    res.json({
      success: true,
      message: 'AGP test completed successfully',
      taskId: task.id,
      events: events,
      note: 'Check Surfer-H for detailed results'
    });

  } catch (error) {
    console.error('❌ Erreur AGP:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.toString()
    });
  }
};

/**
 * POST /api/agp/run
 * Exécute une tâche personnalisée
 *
 * Body:
 * {
 *   "objective": "Search for the best smartphones",
 *   "startUrl": "https://google.com"
 * }
 */
export const runTask = async (req, res) => {
  try {
    const { objective, startUrl } = req.body;

    if (!objective) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: objective'
      });
    }

    console.log(`🚀 Lancement de la tâche: ${objective}`);

    const agent = initializeAgent();
    const task = await agent.run(objective, { startUrl: startUrl || 'https://google.com' });

    console.log(`✅ Tâche créée: ${task.id}`);

    // Collecter les événements
    const events = [];
    let finalResult = null;

    task.onUpdate((event) => {
      console.log(`📡 [${event.type}]`, event.data);
      events.push({
        type: event.type,
        timestamp: new Date().toISOString(),
        data: event.data
      });
    });

    task.onChatMessage((message) => {
      console.log(`💬 Message: ${message.data.content}`);
      finalResult = message.data.content;
    });

    task.onWebAction((action) => {
      console.log(`🌐 Action: ${action.data.action.action_type}`);
    });

    task.onError((error) => {
      console.error(`❌ Erreur:`, error);
    });

    // Attendre la complétion
    await task.waitForCompletion();

    console.log('✅ Tâche terminée!');

    res.json({
      success: true,
      message: 'Task completed successfully',
      taskId: task.id,
      objective: objective,
      result: finalResult,
      eventsCount: events.length,
      events: events.slice(-5), // Retourner seulement les 5 derniers événements
      note: 'Check Surfer-H for full details'
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution de la tâche:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.toString()
    });
  }
};

/**
 * POST /api/agp/batch
 * Exécute plusieurs tâches en parallèle
 *
 * Body:
 * {
 *   "tasks": [
 *     { "objective": "Check weather for Paris", "startUrl": "https://weather.com" },
 *     { "objective": "Look up restaurants in Paris", "startUrl": "https://google.com" }
 *   ]
 * }
 */
export const runBatchTasks = async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid tasks array'
      });
    }

    console.log(`🚀 Lancement de ${tasks.length} tâches en parallèle...`);

    const agent = initializeAgent();
    const agpTasks = await agent.runBatch(tasks);

    console.log(`✅ ${agpTasks.length} tâches créées`);

    const results = [];

    // Attacher des listeners à chaque tâche
    agpTasks.forEach((task, index) => {
      const taskResult = {
        id: task.id,
        objective: tasks[index].objective,
        events: [],
        status: 'running'
      };

      task.onStatusChange((status) => {
        console.log(`🔄 Tâche ${task.id} - Statut: ${status}`);
        taskResult.status = status;
      });

      task.onChatMessage((message) => {
        console.log(`💬 Tâche ${task.id} - Message: ${message.data.content}`);
        taskResult.result = message.data.content;
      });

      task.onError((error) => {
        console.error(`❌ Tâche ${task.id} - Erreur:`, error);
        taskResult.error = error.message;
      });

      results.push(taskResult);
    });

    // Attendre la complétion de toutes les tâches
    await agent.waitForAllComplete(agpTasks);

    console.log('✅ Toutes les tâches terminées!');

    res.json({
      success: true,
      message: 'All tasks completed successfully',
      tasksCount: agpTasks.length,
      results: results
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution batch:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.toString()
    });
  }
};

/**
 * POST /api/agp/shop
 * Utilise la méthode shopFor pour comparer des prix
 *
 * Body:
 * {
 *   "products": ["iPhone 15 Pro", "Samsung Galaxy S24"]
 * }
 */
export const shopForProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid products array'
      });
    }

    console.log(`🛒 Recherche de prix pour ${products.length} produits...`);

    const agent = initializeAgent();
    const results = [];

    for (const product of products) {
      console.log(`🔍 Recherche: ${product}`);

      const task = await agent.shopFor(product);
      const productResult = {
        product: product,
        taskId: task.id,
        events: []
      };

      task.onUpdate((event) => {
        if (event.type === 'ChatMessageEvent') {
          console.log(`💬 ${product} - ${event.data.content}`);
          productResult.result = event.data.content;
        }
      });

      await task.waitForCompletion();

      results.push(productResult);
      console.log(`✅ ${product} - Terminé`);
    }

    res.json({
      success: true,
      message: 'Shopping comparison completed',
      productsCount: products.length,
      results: results
    });

  } catch (error) {
    console.error('❌ Erreur lors de la recherche de produits:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.toString()
    });
  }
};

/**
 * POST /api/agp/search-from-json
 * Recherche les produits du fichier JSON sur La Vie Claire
 *
 * Cette fonction lit le fichier product_to_search.json,
 * extrait tous les ingrédients et lance une recherche AGP pour chacun
 */
export const searchProductsFromJson = async (req, res) => {
  try {
    console.log('🔍 Démarrage de la recherche des produits depuis le JSON...');

    // Lire le fichier JSON
    const jsonPath = path.join(__dirname, '../../data/product_to_search.json');

    if (!fs.existsSync(jsonPath)) {
      return res.status(404).json({
        success: false,
        error: 'Fichier product_to_search.json non trouvé'
      });
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`📋 ${jsonData.recipes.length} recette(s) trouvée(s)`);

    // Extraire tous les ingrédients de toutes les recettes
    const allIngredients = [];
    jsonData.recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        allIngredients.push({
          name: ingredient.name,
          quantity: ingredient.quantity,
          category: ingredient.category,
          recipe: recipe.name
        });
      });
    });

    console.log(`🛒 ${allIngredients.length} ingrédient(s) à rechercher`);

    // Initialiser l'agent
    const agent = initializeAgent();

    // Créer le prompt pour chaque produit
    const createPrompt = (productName) => `Tu es un agent d'achat intelligent chargé de trouver les meilleurs produits correspondant à une liste de courses donnée.
Tu dois effectuer les recherches sur le *site la vie claire* tu commences directement dans la section commandez en ligne.

### 🎯 *Objectif*

Pour chaque produit de la liste, sélectionne *jusqu'à 4 produits comparables* et choisis celui qui répond le mieux aux critères pondérés ci-dessous.
Analyse les informations affichées sur la page produit : prix, Nutriscore, label bio, origine

Voici le produit à rechercher :

${productName}

### 🧭 *Instructions de navigation*

1. Va sur [https://mescoursesenligne.lavieclaire.com/].
2. Recherche le produit
3. Récupère les informations de jusqu'à *4 références* pertinentes pour ce produit.
4. Pour extraire les informations des références
   a. va sur la page produit et extrait les informations
   b. retourne sur la barre de recherche et recherche le même nom de produit, puis sélectionne une autre référence pour l'analyser.
   c. conserve ces informations en mémoire pour préparer ta réponse
   d. Passes au point 5 quand tu les as tous vus ou au maximum 4
5. Output : le *résumé final pour le produits en listant les informations pour chaque référence analysée*.`;

    // Créer les tâches pour le batch
    const tasks = allIngredients.map(ingredient => ({
      objective: createPrompt(ingredient.name),
      startUrl: 'https://mescoursesenligne.lavieclaire.com/'
    }));

    console.log(`🚀 Lancement de ${tasks.length} recherches en parallèle...`);

    // Lancer toutes les tâches en batch
    const agpTasks = await agent.runBatch(tasks);

    console.log(`✅ ${agpTasks.length} tâches créées`);

    const results = [];

    // Attacher des listeners à chaque tâche
    agpTasks.forEach((task, index) => {
      const ingredient = allIngredients[index];
      const taskResult = {
        ingredient: ingredient.name,
        quantity: ingredient.quantity,
        category: ingredient.category,
        recipe: ingredient.recipe,
        taskId: task.id,
        status: 'running',
        events: [],
        finalResult: null
      };

      // Écouter les changements de statut
      task.onStatusChange((status) => {
        console.log(`🔄 [${ingredient.name}] Statut: ${status}`);
        taskResult.status = status;
      });

      // Écouter les messages de chat pour récupérer le résultat final
      task.onChatMessage((message) => {
        console.log(`💬 [${ingredient.name}] Message: ${message.data.content.substring(0, 100)}...`);

        // Stocker seulement les messages texte (pas les screenshots)
        if (message.data.type !== 'screenshot') {
          taskResult.events.push({
            type: message.data.type,
            content: message.data.content,
            timestamp: new Date().toISOString()
          });

          // Le dernier message texte sera probablement le résumé final
          if (message.data.type === 'text' || message.data.type === 'message') {
            taskResult.finalResult = message.data.content;
          }
        }
      });

      // Écouter les actions web
      task.onWebAction((action) => {
        console.log(`🌐 [${ingredient.name}] Action: ${action.data.action.action_type}`);
      });

      // Écouter les erreurs
      task.onError((error) => {
        console.error(`❌ [${ingredient.name}] Erreur:`, error);
        taskResult.error = error.message;
      });

      results.push(taskResult);
    });

    // Démarrer le polling pour toutes les tâches
    agpTasks.forEach(task => task.startPolling());

    console.log('⏳ Attente de la complétion de toutes les tâches...');

    // Attendre que toutes les tâches se terminent
    await agent.waitForAllComplete(agpTasks);

    console.log('✅ Toutes les recherches terminées!');

    // Préparer la réponse
    const response = {
      success: true,
      message: 'Recherche terminée avec succès',
      totalIngredients: allIngredients.length,
      recipes: jsonData.recipes.map(recipe => recipe.name),
      results: results.map(r => ({
        ingredient: r.ingredient,
        quantity: r.quantity,
        category: r.category,
        recipe: r.recipe,
        taskId: r.taskId,
        status: r.status,
        result: r.finalResult,
        error: r.error,
        eventsCount: r.events.length
      })),
      note: 'Consultez Surfer-H pour voir les détails complets de chaque recherche'
    };

    // Sauvegarder les résultats dans des fichiers texte
    console.log('💾 Sauvegarde des résultats dans des fichiers...');

    const outputDir = path.join(__dirname, '../../data/agpresp');

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Générer un timestamp pour le nom du fichier
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');

    // 1. Sauvegarder un fichier global avec tous les résultats
    const globalFileName = `recherche_${timestamp}.txt`;
    const globalFilePath = path.join(outputDir, globalFileName);

    let globalContent = `═══════════════════════════════════════════════════════════════
RECHERCHE DE PRODUITS SUR LA VIE CLAIRE
═══════════════════════════════════════════════════════════════

Date: ${new Date().toLocaleString('fr-FR')}
Nombre total d'ingrédients: ${allIngredients.length}
Recettes: ${jsonData.recipes.map(r => r.name).join(', ')}

═══════════════════════════════════════════════════════════════

`;

    results.forEach((result, index) => {
      globalContent += `
┌─────────────────────────────────────────────────────────────┐
│ PRODUIT ${index + 1}/${results.length}
└─────────────────────────────────────────────────────────────┘

🏷️  Ingrédient: ${result.ingredient}
📦 Quantité: ${result.quantity}
📁 Catégorie: ${result.category}
🍽️  Recette: ${result.recipe}

🆔 Task ID: ${result.taskId}
📊 Statut: ${result.status}
📈 Événements capturés: ${result.events.length}

${result.error ? `❌ ERREUR: ${result.error}\n` : ''}
${result.finalResult ? `
📝 RÉSULTAT:
─────────────────────────────────────────────────────────────
${result.finalResult}
─────────────────────────────────────────────────────────────
` : '⚠️  Aucun résultat disponible'}

`;
    });

    globalContent += `
═══════════════════════════════════════════════════════════════
FIN DE LA RECHERCHE
═══════════════════════════════════════════════════════════════

💡 Pour voir les détails complets avec screenshots:
   Visitez https://surfer.h-company.ai

📂 Fichiers individuels sauvegardés dans:
   ${outputDir}

`;

    fs.writeFileSync(globalFilePath, globalContent, 'utf-8');
    console.log(`✅ Fichier global sauvegardé: ${globalFileName}`);

    // 2. Sauvegarder un fichier par produit
    results.forEach((result) => {
      // Nettoyer le nom du fichier (enlever les caractères spéciaux)
      const cleanName = result.ingredient
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');

      const productFileName = `${cleanName}_${timestamp}.txt`;
      const productFilePath = path.join(outputDir, productFileName);

      let productContent = `═══════════════════════════════════════════════════════════════
PRODUIT: ${result.ingredient}
═══════════════════════════════════════════════════════════════

📋 INFORMATIONS GÉNÉRALES
─────────────────────────────────────────────────────────────
• Nom: ${result.ingredient}
• Quantité demandée: ${result.quantity}
• Catégorie: ${result.category}
• Recette: ${result.recipe}

🔍 DÉTAILS DE LA RECHERCHE
─────────────────────────────────────────────────────────────
• Date: ${new Date().toLocaleString('fr-FR')}
• Task ID: ${result.taskId}
• Statut: ${result.status}
• Événements capturés: ${result.events.length}

`;

      if (result.error) {
        productContent += `
❌ ERREUR
─────────────────────────────────────────────────────────────
${result.error}

`;
      }

      if (result.finalResult) {
        productContent += `
📝 RÉSULTATS DE LA RECHERCHE SUR LA VIE CLAIRE
─────────────────────────────────────────────────────────────

${result.finalResult}

`;
      } else {
        productContent += `
⚠️  AUCUN RÉSULTAT DISPONIBLE
─────────────────────────────────────────────────────────────
La recherche n'a pas retourné de résultat exploitable.

`;
      }

      productContent += `
═══════════════════════════════════════════════════════════════
💡 VOIR PLUS DE DÉTAILS
═══════════════════════════════════════════════════════════════

Pour consulter les screenshots et l'historique complet:
🔗 https://surfer.h-company.ai/tasks/${result.taskId}

`;

      fs.writeFileSync(productFilePath, productContent, 'utf-8');
      console.log(`   ✅ ${productFileName}`);
    });

    console.log(`\n💾 ${results.length + 1} fichier(s) sauvegardé(s) dans ${outputDir}`);

    // Ajouter les chemins des fichiers dans la réponse
    response.savedFiles = {
      globalFile: globalFilePath,
      productFiles: results.map(r => {
        const cleanName = r.ingredient.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        return path.join(outputDir, `${cleanName}_${timestamp}.txt`);
      })
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Erreur lors de la recherche depuis JSON:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.toString()
    });
  }
};

/**
 * Fonction autonome pour lancer la recherche automatiquement
 * (appelée par le watcher, sans req/res)
 *
 * Retourne le résultat au lieu de l'envoyer via HTTP
 */
export const searchProductsAutomatically = async () => {
  try {
    console.log('🔍 Démarrage de la recherche automatique...');

    // Lire le fichier JSON
    const jsonPath = path.join(__dirname, '../../data/product_to_search.json');

    if (!fs.existsSync(jsonPath)) {
      throw new Error('Fichier product_to_search.json non trouvé');
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`📋 ${jsonData.recipes.length} recette(s) trouvée(s)`);

    // Extraire tous les ingrédients
    const allIngredients = [];
    jsonData.recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        allIngredients.push({
          name: ingredient.name,
          quantity: ingredient.quantity,
          category: ingredient.category,
          recipe: recipe.name
        });
      });
    });

    console.log(`🛒 ${allIngredients.length} ingrédient(s) à rechercher`);

    // Initialiser l'agent
    const agent = initializeAgent();

    // Créer le prompt pour chaque produit
    const createPrompt = (productName) => `Tu es un agent d'achat intelligent chargé de trouver les meilleurs produits correspondant à une liste de courses donnée.
Tu dois effectuer les recherches sur le *site la vie claire* tu commences directement dans la section commandez en ligne.

### 🎯 *Objectif*

Pour chaque produit de la liste, sélectionne *jusqu'à 4 produits comparables* et choisis celui qui répond le mieux aux critères pondérés ci-dessous.
Analyse les informations affichées sur la page produit : prix, Nutriscore, label bio, origine

Voici le produit à rechercher :

${productName}

### 🧭 *Instructions de navigation*

1. Va sur [https://mescoursesenligne.lavieclaire.com/].
2. Recherche le produit
3. Récupère les informations de jusqu'à *4 références* pertinentes pour ce produit.
4. Pour extraire les informations des références
   a. va sur la page produit et extrait les informations
   b. retourne sur la barre de recherche et recherche le même nom de produit, puis sélectionne une autre référence pour l'analyser.
   c. conserve ces informations en mémoire pour préparer ta réponse
   d. Passes au point 5 quand tu les as tous vus ou au maximum 4
5. Output : le *résumé final pour le produits en listant les informations pour chaque référence analysée*.`;

    // Créer les tâches pour le batch
    const tasks = allIngredients.map(ingredient => ({
      objective: createPrompt(ingredient.name),
      startUrl: 'https://mescoursesenligne.lavieclaire.com/'
    }));

    console.log(`🚀 Lancement de ${tasks.length} recherches en parallèle...`);

    // Lancer toutes les tâches en batch
    const agpTasks = await agent.runBatch(tasks);

    console.log(`✅ ${agpTasks.length} tâches créées`);

    const results = [];

    // Attacher des listeners à chaque tâche
    agpTasks.forEach((task, index) => {
      const ingredient = allIngredients[index];
      const taskResult = {
        ingredient: ingredient.name,
        quantity: ingredient.quantity,
        category: ingredient.category,
        recipe: ingredient.recipe,
        taskId: task.id,
        status: 'running',
        events: [],
        finalResult: null
      };

      task.onStatusChange((status) => {
        console.log(`🔄 [${ingredient.name}] Statut: ${status}`);
        taskResult.status = status;
      });

      task.onChatMessage((message) => {
        if (message.data.type !== 'screenshot') {
          taskResult.events.push({
            type: message.data.type,
            content: message.data.content,
            timestamp: new Date().toISOString()
          });

          if (message.data.type === 'text' || message.data.type === 'message') {
            taskResult.finalResult = message.data.content;
          }
        }
      });

      task.onWebAction((action) => {
        console.log(`🌐 [${ingredient.name}] Action: ${action.data.action.action_type}`);
      });

      task.onError((error) => {
        console.error(`❌ [${ingredient.name}] Erreur:`, error);
        taskResult.error = error.message;
      });

      results.push(taskResult);
    });

    // Démarrer le polling
    agpTasks.forEach(task => task.startPolling());

    console.log('⏳ Attente de la complétion de toutes les tâches...');

    // Attendre la complétion
    await agent.waitForAllComplete(agpTasks);

    console.log('✅ Toutes les recherches terminées!');

    // Préparer le résultat
    const response = {
      success: true,
      message: 'Recherche terminée avec succès',
      totalIngredients: allIngredients.length,
      recipes: jsonData.recipes.map(recipe => recipe.name),
      results: results.map(r => ({
        ingredient: r.ingredient,
        quantity: r.quantity,
        category: r.category,
        recipe: r.recipe,
        taskId: r.taskId,
        status: r.status,
        result: r.finalResult,
        error: r.error,
        eventsCount: r.events.length
      })),
      note: 'Consultez Surfer-H pour voir les détails complets de chaque recherche'
    };

    // Sauvegarder les résultats
    console.log('💾 Sauvegarde des résultats dans des fichiers...');

    const outputDir = path.join(__dirname, '../../data/agpresp');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');

    // Fichier global
    const globalFileName = `recherche_${timestamp}.txt`;
    const globalFilePath = path.join(outputDir, globalFileName);

    let globalContent = `═══════════════════════════════════════════════════════════════
RECHERCHE DE PRODUITS SUR LA VIE CLAIRE (AUTOMATIQUE)
═══════════════════════════════════════════════════════════════

Date: ${new Date().toLocaleString('fr-FR')}
Nombre total d'ingrédients: ${allIngredients.length}
Recettes: ${jsonData.recipes.map(r => r.name).join(', ')}

═══════════════════════════════════════════════════════════════

`;

    results.forEach((result, index) => {
      globalContent += `
┌─────────────────────────────────────────────────────────────┐
│ PRODUIT ${index + 1}/${results.length}
└─────────────────────────────────────────────────────────────┘

🏷️  Ingrédient: ${result.ingredient}
📦 Quantité: ${result.quantity}
📁 Catégorie: ${result.category}
🍽️  Recette: ${result.recipe}

🆔 Task ID: ${result.taskId}
📊 Statut: ${result.status}
📈 Événements capturés: ${result.events.length}

${result.error ? `❌ ERREUR: ${result.error}\n` : ''}
${result.finalResult ? `
📝 RÉSULTAT:
─────────────────────────────────────────────────────────────
${result.finalResult}
─────────────────────────────────────────────────────────────
` : '⚠️  Aucun résultat disponible'}

`;
    });

    globalContent += `
═══════════════════════════════════════════════════════════════
FIN DE LA RECHERCHE AUTOMATIQUE
═══════════════════════════════════════════════════════════════

💡 Pour voir les détails complets avec screenshots:
   Visitez https://surfer.h-company.ai

📂 Fichiers individuels sauvegardés dans:
   ${outputDir}

`;

    fs.writeFileSync(globalFilePath, globalContent, 'utf-8');
    console.log(`✅ Fichier global sauvegardé: ${globalFileName}`);

    // Fichiers par produit
    results.forEach((result) => {
      const cleanName = result.ingredient
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');

      const productFileName = `${cleanName}_${timestamp}.txt`;
      const productFilePath = path.join(outputDir, productFileName);

      let productContent = `═══════════════════════════════════════════════════════════════
PRODUIT: ${result.ingredient} (Recherche Automatique)
═══════════════════════════════════════════════════════════════

📋 INFORMATIONS GÉNÉRALES
─────────────────────────────────────────────────────────────
• Nom: ${result.ingredient}
• Quantité demandée: ${result.quantity}
• Catégorie: ${result.category}
• Recette: ${result.recipe}

🔍 DÉTAILS DE LA RECHERCHE
─────────────────────────────────────────────────────────────
• Date: ${new Date().toLocaleString('fr-FR')}
• Task ID: ${result.taskId}
• Statut: ${result.status}
• Événements capturés: ${result.events.length}
• Mode: Automatique (déclenché par modification du JSON)

`;

      if (result.error) {
        productContent += `
❌ ERREUR
─────────────────────────────────────────────────────────────
${result.error}

`;
      }

      if (result.finalResult) {
        productContent += `
📝 RÉSULTATS DE LA RECHERCHE SUR LA VIE CLAIRE
─────────────────────────────────────────────────────────────

${result.finalResult}

`;
      } else {
        productContent += `
⚠️  AUCUN RÉSULTAT DISPONIBLE
─────────────────────────────────────────────────────────────
La recherche n'a pas retourné de résultat exploitable.

`;
      }

      productContent += `
═══════════════════════════════════════════════════════════════
💡 VOIR PLUS DE DÉTAILS
═══════════════════════════════════════════════════════════════

Pour consulter les screenshots et l'historique complet:
🔗 https://surfer.h-company.ai/tasks/${result.taskId}

`;

      fs.writeFileSync(productFilePath, productContent, 'utf-8');
      console.log(`   ✅ ${productFileName}`);
    });

    console.log(`\n💾 ${results.length + 1} fichier(s) sauvegardé(s) dans ${outputDir}`);

    // Ajouter les chemins des fichiers
    response.savedFiles = {
      globalFile: globalFilePath,
      productFiles: results.map(r => {
        const cleanName = r.ingredient.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        return path.join(outputDir, `${cleanName}_${timestamp}.txt`);
      })
    };

    return response;

  } catch (error) {
    console.error('❌ Erreur lors de la recherche automatique:', error);
    throw error;
  }
};
