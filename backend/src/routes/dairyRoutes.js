import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { createSupplier, deleteEntry, getSupplier, listSuppliers, saveEntry, savePayment, updateSupplier } from '../controllers/dairyController.js';

const router = Router();
router.use(protect);
router.get('/suppliers', listSuppliers); router.post('/suppliers', createSupplier);
router.get('/suppliers/:supplierId', getSupplier); router.put('/suppliers/:supplierId', updateSupplier);
router.post('/suppliers/:supplierId/entries', saveEntry); router.delete('/suppliers/:supplierId/entries/:entryId', deleteEntry);
router.post('/suppliers/:supplierId/payments', savePayment);
export default router;
