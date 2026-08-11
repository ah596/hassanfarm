import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { listFeed, createFeed, updateFeed, deleteFeed } from '../controllers/feedController.js';

const router = Router();
router.use(protect);
router.get('/', listFeed);
router.post('/', createFeed);
router.put('/:id', updateFeed);
router.delete('/:id', deleteFeed);

export default router;
