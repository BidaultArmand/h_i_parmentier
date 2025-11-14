import express from 'express';
import {
  getBasket,
  addToBasket,
  removeFromBasket,
  optimizeBasket,
  compareBasket,
  createBasket,
  getAllBaskets,
  deleteBasket
} from '../controllers/basketController.js';

const router = express.Router();

// POST /api/basket/create - Create new basket
router.post('/create', createBasket);

// GET /api/basket/all - Get all baskets for a user
router.get('/all', getAllBaskets);

// GET /api/basket - Get current basket
router.get('/', getBasket);

// POST /api/basket - Add item to basket
router.post('/', addToBasket);

// DELETE /api/basket/delete/:basketId - Delete a basket
router.delete('/delete/:basketId', deleteBasket);

// DELETE /api/basket/:itemId - Remove item from basket
router.delete('/:itemId', removeFromBasket);

// POST /api/basket/optimize - AI optimize basket
router.post('/optimize', optimizeBasket);

// POST /api/basket/compare - Compare prices across stores
router.post('/compare', compareBasket);

export default router;
