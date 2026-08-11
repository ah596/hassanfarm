import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { listExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController.js';

const router = Router();
router.use(protect);
router.get('/', listExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
