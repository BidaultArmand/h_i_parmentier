import express from 'express';
import { chat, createBasketFromChat } from '../controllers/chatController.js';

const router = express.Router();

// POST /api/chat - Send message to AI assistant
router.post('/', chat);

// POST /api/chat/create-basket - Create basket from chat suggestions
router.post('/create-basket', createBasketFromChat);

export default router;
