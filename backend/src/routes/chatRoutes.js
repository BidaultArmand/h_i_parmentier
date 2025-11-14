import express from 'express';
import { 
  chat, 
  createBasketFromChat, 
  summarizePreferences, 
  generateRecipes, 
  generateIngredients 
} from '../controllers/chatController.js';

const router = express.Router();

// POST /api/chat - Send message to AI assistant
router.post('/', chat);

// POST /api/chat/create-basket - Create basket from chat suggestions
router.post('/create-basket', createBasketFromChat);

// POST /api/chat/summarize - Summarize user preferences into key phrases
router.post('/summarize', summarizePreferences);

// POST /api/chat/generate-recipes - Generate recipes based on context
router.post('/generate-recipes', generateRecipes);

// POST /api/chat/generate-ingredients - Generate ingredients JSON from recipes
router.post('/generate-ingredients', generateIngredients);

export default router;
