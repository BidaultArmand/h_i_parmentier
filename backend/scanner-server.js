// backend/scanner-server.js

console.log(">>> scanner-server.js loaded (ESM)");

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.SCANNER_PORT || 5080;

app.use(cors());
app.use(express.json());

// Petit cache en mémoire
const cache = new Map();

/**
 * Score nutritionnel simplifié (compatible avec ton UI)
 * + règle spéciale : eau pure = 100 / Excellent
 */
function computeScore(product) {
  const nutriments = product.nutriments || {};

  const fiber = nutriments.fiber_100g ?? 0;
  const proteins = nutriments.proteins_100g ?? 0;
  const sugars = nutriments.sugars_100g ?? 0;
  const satFat = nutriments['saturated-fat_100g'] ?? 0;

  const fiberPoints = Math.min(fiber * 2, 20);
  const proteinPoints = Math.min(proteins * 2, 20);
  const sugarPoints = Math.max((sugars - 5) * 2, 0);
  const satFatPoints = Math.max((satFat - 1) * 3, 0);

  let nutritionScore =
    50 + fiberPoints + proteinPoints - sugarPoints - satFatPoints;
  nutritionScore = Math.max(0, Math.min(100, nutritionScore));

  const additivesTags = product.additives_tags || [];
  const riskyAdditives = additivesTags.map((tag) => ({
    tag,
    severity: 'inconnu',
  }));
  const additivesPenalty = additivesTags.length * 2;

  const allergens = product.allergens_tags || [];
  const allergenPenalty = allergens.length > 0 ? -10 : 0;

  let total = Math.max(
    0,
    Math.min(100, nutritionScore - additivesPenalty + allergenPenalty)
  );

  // 💧 Règle spéciale pour l'eau
  const categories = product.categories_tags || [];
  const isWaterCategory = categories.some((tag) =>
    tag.includes('waters')
  );

  const isPureWater =
    isWaterCategory &&
    sugars === 0 &&
    satFat === 0 &&
    additivesTags.length === 0;

  if (isPureWater) {
    total = 100;
  }

  let grade;
  if (total >= 80) grade = 'excellent';
  else if (total >= 60) grade = 'good';
  else if (total >= 40) grade = 'average';
  else grade = 'poor';

  return {
    total: Math.round(total),
    grade,
    breakdown: {
      nutrition: {
        score: Math.round(isPureWater ? 100 : nutritionScore),
        details: {
          fiberPoints: Math.round(fiberPoints),
          proteinPoints: Math.round(proteinPoints),
          sugarPoints: Math.round(sugarPoints),
          satFatPoints: Math.round(satFatPoints),
        },
      },
      additives: {
        penalty: isPureWater ? 0 : -additivesPenalty,
        riskyAdditives,
      },
      allergenPenalty: isPureWater ? 0 : allergenPenalty,
    },
  };
}

/**
 * POST /scan
 * → récupère les infos depuis Open Food Facts
 */
app.post('/scan', async (req, res) => {
  const { barcode } = req.body || {};

  if (!barcode) {
    return res.status(400).json({ error: 'Barcode manquant.' });
  }

  // Normaliser (enlever les espaces)
  const normalized = String(barcode).replace(/\s+/g, '');

  if (cache.has(normalized)) {
    console.log('[SCAN] cache hit for', normalized);
    return res.json(cache.get(normalized));
  }

  try {
    console.log('[SCAN] fetching OFF for', normalized);

    const offRes = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${normalized}.json`
    );

    if (!offRes.ok) {
      console.error('[SCAN] OFF error status', offRes.status);
      return res.status(502).json({ error: 'Erreur Open Food Facts.' });
    }

    const data = await offRes.json();

    if (data.status !== 1 || !data.product) {
      console.warn('[SCAN] product not found in OFF for', normalized);
      return res.status(404).json({ error: 'Produit introuvable.' });
    }

    const product = data.product;
    const score = computeScore(product);

    const payload = {
      barcode: normalized,
      product: {
        name:
          product.product_name_fr ||
          product.product_name ||
          product.generic_name_fr ||
          product.generic_name ||
          'Produit sans nom',
        brands: product.brands || 'Marque inconnue',
        imageUrl: product.image_front_url || product.image_url || null,
      },
      score,
    };

    cache.set(normalized, payload);
    console.log('[SCAN] success for', normalized, 'score=', score.total);
    res.json(payload);
  } catch (err) {
    console.error('[SCAN] server error for', barcode, err);
    res.status(500).json({ error: 'Erreur interne serveur.' });
  }
});

/**
 * GET /scan/:barcode
 * → lit le cache
 */
app.get('/scan/:barcode', (req, res) => {
  const normalized = String(req.params.barcode).replace(/\s+/g, '');
  if (!cache.has(normalized)) {
    return res.status(404).json({ error: 'Scan not found' });
  }
  res.json(cache.get(normalized));
});

app.listen(PORT, () => {
  console.log(`Scanner API running on http://localhost:${PORT}`);
});
