import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import { MemoryCache } from './cache/memoryCache.js';
import { fetchProductByBarcode } from './services/openFoodFacts.js';
import { scoreProduct } from './scoring/productScore.js';

dotenv.config();

const PORT = Number(process.env.SCANNER_PORT ?? 5080);
const CACHE_TTL = Number(process.env.SCANNER_CACHE_TTL ?? 3600);

const app = express();
const cache = new MemoryCache({ ttl: CACHE_TTL });

const scanSchema = z.object({
  barcode: z.string().min(8).max(20),
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    cacheEntries: cache.store?.size ?? 0,
  });
});

app.get('/scan/:barcode', (req, res) => {
  const cached = cache.get(req.params.barcode);
  if (!cached) {
    return res.status(404).json({ error: 'Scan not found in cache' });
  }
  res.json({ ...cached, cached: true });
});

app.post('/scan', async (req, res) => {
  const parsed = scanSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const { barcode } = parsed.data;

  const cached = cache.get(barcode);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  try {
    const product = await fetchProductByBarcode(barcode);
    const score = scoreProduct(product);

    const payload = {
      barcode,
      fetchedAt: new Date().toISOString(),
      product: {
        name: product.product_name,
        brands: product.brands,
        quantity: product.quantity,
        servingSize: product.serving_size,
        categories: product.categories,
        labels: product.labels,
        nutriScore: product.nutriscore_grade,
        novaGroup: product.nova_group,
        ecoScore: product.ecoscore_grade,
        images: {
          front: product.image_front_small_url || product.image_url,
        },
        nutriments: product.nutriments,
        additives: product.additives_tags,
        allergens: product.allergens,
      },
      score,
    };

    cache.set(barcode, payload);
    res.json(payload);
  } catch (error) {
    console.error('Scan error:', error.message);
    res.status(404).json({
      error: 'Product not found or unavailable',
      message: error.message,
    });
  }
});

app.use((err, req, res, _next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Unexpected scanner service error' });
});

app.listen(PORT, () => {
  console.log(`🧪 Yuka Scanner service listening on http://localhost:${PORT}`);
});
