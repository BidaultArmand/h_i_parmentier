/**
 * AGP Routes
 *
 * Routes pour tester et utiliser le SDK AGP
 */

import express from 'express';
import {
  testAgp,
  runTask,
  runBatchTasks,
  shopForProducts,
  searchProductsFromJson
} from '../controllers/agpController.js';

const router = express.Router();

/**
 * @route   POST /api/agp/test
 * @desc    Test simple du SDK AGP avec une tâche prédéfinie
 * @access  Public (à sécuriser en production)
 */
router.post('/test', testAgp);

/**
 * @route   POST /api/agp/run
 * @desc    Exécute une tâche personnalisée
 * @body    { objective: string, startUrl?: string }
 * @access  Public (à sécuriser en production)
 */
router.post('/run', runTask);

/**
 * @route   POST /api/agp/batch
 * @desc    Exécute plusieurs tâches en parallèle
 * @body    { tasks: [{ objective: string, startUrl?: string }] }
 * @access  Public (à sécuriser en production)
 */
router.post('/batch', runBatchTasks);

/**
 * @route   POST /api/agp/shop
 * @desc    Compare les prix de plusieurs produits
 * @body    { products: string[] }
 * @access  Public (à sécuriser en production)
 */
router.post('/shop', shopForProducts);

/**
 * @route   POST /api/agp/search-from-json
 * @desc    Recherche tous les produits du fichier product_to_search.json sur La Vie Claire
 * @access  Public (à sécuriser en production)
 */
router.post('/search-from-json', searchProductsFromJson);

export default router;
