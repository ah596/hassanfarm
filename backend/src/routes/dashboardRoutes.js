import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getDashboard } from '../controllers/dashboardController.js';

const router = Router();
router.use(protect);
router.get('/', getDashboard);

export default router;
