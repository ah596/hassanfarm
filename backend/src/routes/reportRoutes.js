import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { profitReport, salesReport, expenseReport, monthlyProfitReport } from '../controllers/reportController.js';

const router = Router();
router.use(protect);
router.get('/profit', profitReport);
router.get('/sales', salesReport);
router.get('/expenses', expenseReport);
router.get('/monthly-profit', monthlyProfitReport);

export default router;
