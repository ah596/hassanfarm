import { asyncHandler } from '../utils/asyncHandler.js';
import { collectionRefs } from '../services/firestore.js';
import { expenseSchema } from '../utils/validators.js';
import { AppError } from '../utils/errors.js';
import { nextDocId } from '../services/idGenerator.js';

const toDoc = doc => ({ id: doc.id, ...doc.data() });

export const listExpenses = asyncHandler(async (req, res) => {
  const snap = await collectionRefs.expenses().where('userId', '==', req.user.uid).get();
  const expenses = snap.docs.map(toDoc);
  expenses.sort((a, b) => {
    const d1 = new Date(a.date).getTime() || 0;
    const d2 = new Date(b.date).getTime() || 0;
    return d2 - d1;
  });
  res.json({ expenses });
});

export const createExpense = asyncHandler(async (req, res) => {
  const payload = expenseSchema.parse(req.body);
  if (payload.animalId) {
    const animals = await collectionRefs.animals().where('animalId', '==', payload.animalId).limit(1).get();
    if (animals.empty) throw new AppError('Animal not found for this expense', 404);
  }

  const id = await nextDocId('expense');
  const doc = {
    expenseId: id,
    ...payload,
    amount: Number(payload.amount),
    userId: req.user.uid,
    createdAt: new Date().toISOString()
  };

  const ref = collectionRefs.expenses().doc();
  await ref.set(doc);
  res.status(201).json({ message: 'Expense created', expense: { id: ref.id, ...doc } });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const existing = await collectionRefs.expenses().doc(req.params.id).get();
  if (!existing.exists) throw new AppError('Expense not found', 404);
  if (existing.data().userId && existing.data().userId !== req.user.uid) throw new AppError('Not authorized', 403);
  const payload = expenseSchema.partial().parse(req.body);
  await collectionRefs.expenses().doc(req.params.id).set(payload, { merge: true });
  const updated = await collectionRefs.expenses().doc(req.params.id).get();
  res.json({ message: 'Expense updated', expense: toDoc(updated) });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const existing = await collectionRefs.expenses().doc(req.params.id).get();
  if (!existing.exists) throw new AppError('Expense not found', 404);
  if (existing.data().userId && existing.data().userId !== req.user.uid) throw new AppError('Not authorized', 403);
  await collectionRefs.expenses().doc(req.params.id).delete();
  res.json({ message: 'Expense deleted' });
});
