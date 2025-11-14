import express from 'express';
import { getProfile, upsertProfile, deleteProfile } from '../controllers/profileController.js';

const router = express.Router();

// GET /api/profile?userId=xxx - Récupérer le profil
router.get('/', getProfile);

// POST /api/profile - Créer ou mettre à jour le profil
router.post('/', upsertProfile);

// DELETE /api/profile?userId=xxx - Supprimer le profil
router.delete('/', deleteProfile);

export default router;
