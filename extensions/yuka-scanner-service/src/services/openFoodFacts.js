import fetch from 'node-fetch';

const DEFAULT_BASE = 'https://world.openfoodfacts.org/api/v2';

const POPULATED_FIELDS = [
  'product_name',
  'brands',
  'categories',
  'labels',
  'nutriscore_grade',
  'nutriscore_score',
  'nutriments',
  'nova_group',
  'image_front_small_url',
  'image_url',
  'ingredients_text',
  'additives_tags',
  'allergens',
  'allergens_tags',
  'quantity',
  'serving_size',
  'stores',
  'ecoscore_grade',
];

export async function fetchProductByBarcode(barcode) {
  const baseUrl = process.env.OFF_API_BASE || DEFAULT_BASE;
  const url = `${baseUrl}/product/${encodeURIComponent(barcode)}.json?fields=${POPULATED_FIELDS.join(',')}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OpenFoodFacts request failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (payload.status !== 1 || !payload.product) {
    throw new Error('Product not found on OpenFoodFacts');
  }

  return payload.product;
}
