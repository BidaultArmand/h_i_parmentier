const ENERGY_BREAKPOINTS = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];
const SUGAR_BREAKPOINTS = [4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40, 45];
const SAT_FAT_BREAKPOINTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SODIUM_BREAKPOINTS = [90, 180, 270, 360, 450, 540, 630, 720, 810, 900];

const POSITIVE_FIBER_BREAKPOINTS = [0.9, 1.9, 2.8, 3.7, 4.7];
const POSITIVE_PROTEIN_BREAKPOINTS = [1.6, 3.2, 4.8, 6.4, 8];

function pointsFromBreakpoints(value, breakpoints) {
  if (value == null) {
    return 0;
  }

  let points = 0;
  for (const limit of breakpoints) {
    if (value > limit) {
      points += 1;
    } else {
      break;
    }
  }
  return points;
}

function positivePoints(value, breakpoints) {
  if (value == null) {
    return 0;
  }

  let points = 0;
  for (const limit of breakpoints) {
    if (value >= limit) {
      points += 1;
    }
  }
  return points;
}

export function computeNutritionScore(product) {
  const nutriments = product?.nutriments ?? {};

  const energy = nutriments['energy-kcal_100g'] ?? nutriments['energy_100g'];
  const sugars = nutriments['sugars_100g'];
  const satFat = nutriments['saturated-fat_100g'];
  const sodium = nutriments['sodium_100g'];
  const fiber = nutriments['fiber_100g'];
  const proteins = nutriments['proteins_100g'];

  const energyPoints = pointsFromBreakpoints(energy, ENERGY_BREAKPOINTS);
  const sugarPoints = pointsFromBreakpoints(sugars, SUGAR_BREAKPOINTS);
  const satFatPoints = pointsFromBreakpoints(satFat, SAT_FAT_BREAKPOINTS);
  const sodiumPoints = pointsFromBreakpoints(sodium ? sodium * 1000 : null, SODIUM_BREAKPOINTS); // convert g -> mg

  const fiberPoints = positivePoints(fiber, POSITIVE_FIBER_BREAKPOINTS);
  const proteinPoints = positivePoints(proteins, POSITIVE_PROTEIN_BREAKPOINTS);

  const negative = energyPoints + sugarPoints + satFatPoints + sodiumPoints;
  const positive = fiberPoints + proteinPoints;

  // Base Nutri-Score style: negative points out of 40, positive adds up to 10
  const rawScore = Math.max(0, 40 - negative) + positive;
  const normalized = Math.min(100, Math.max(0, Math.round((rawScore / 50) * 100)));

  return {
    score: normalized,
    details: {
      energyPoints,
      sugarPoints,
      satFatPoints,
      sodiumPoints,
      fiberPoints,
      proteinPoints,
    },
  };
}
