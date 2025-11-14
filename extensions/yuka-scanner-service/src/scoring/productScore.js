import { computeNutritionScore } from './nutritionScore.js';
import { computeAdditiveScore } from './additiveScore.js';

const ALLERGENS_OF_CONCERN = [
  'milk',
  'eggs',
  'fish',
  'crustaceans',
  'shellfish',
  'tree-nuts',
  'peanuts',
  'soy',
  'wheat',
  'gluten',
  'sesame',
  'sulfites',
  'mustard',
  'lupin',
  'celery',
];

function hasHighAllergens(product) {
  const allergens = [
    ...(product?.allergens_tags ?? []),
    ...(product?.allergens?.split(',') ?? []),
  ].map((a) => a.trim().toLowerCase());

  return ALLERGENS_OF_CONCERN.some((allergen) =>
    allergens.some((tag) => tag.includes(allergen)),
  );
}

function isOrganic(product) {
  const labels = product?.labels_tags ?? [];
  return labels.some((label) => label.includes('organic') || label.includes('bio'));
}

function gradeFromScore(score) {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'average';
  return 'poor';
}

export function scoreProduct(product) {
  const nutrition = computeNutritionScore(product);
  const additives = computeAdditiveScore(product?.additives_tags);
  const organicBonus = isOrganic(product) ? 5 : 0;
  const allergenPenalty = hasHighAllergens(product) ? -5 : 0;

  let total =
    nutrition.score * 0.6 +
    additives.score * 0.3 +
    organicBonus +
    allergenPenalty;

  total = Math.min(100, Math.max(0, Math.round(total)));

  return {
    total,
    grade: gradeFromScore(total),
    breakdown: {
      nutrition,
      additives,
      organicBonus,
      allergenPenalty,
    },
  };
}
