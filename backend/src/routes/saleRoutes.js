import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { listSales, createSale, updateSale, deleteSale } from '../controllers/saleController.js';

const router = Router();
router.use(protect);
router.get('/', listSales);
router.post('/', createSale);
router.put('/:id', updateSale);
router.delete('/:id', deleteSale);

export default router;
