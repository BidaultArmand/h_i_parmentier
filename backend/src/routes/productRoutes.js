import express from 'express';
import {
  getProducts,
  getProductById,
  searchProducts,
  scanBarcode
} from '../controllers/productController.js';

const router = express.Router();

// GET /api/products - Get all products
router.get('/', getProducts);

// GET /api/products/search?q=query - Search products
router.get('/search', searchProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', getProductById);

// POST /api/products/scan - Scan barcode
router.post('/scan', scanBarcode);

export default router;
