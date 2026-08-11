import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { listMedicine, createMedicine, updateMedicine, deleteMedicine } from '../controllers/medicineController.js';

const router = Router();
router.use(protect);
router.get('/', listMedicine);
router.post('/', createMedicine);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);

export default router;
