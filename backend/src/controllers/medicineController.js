import { asyncHandler } from '../utils/asyncHandler.js';
import { collectionRefs } from '../services/firestore.js';
import { medicineSchema } from '../utils/validators.js';
import { nextDocId } from '../services/idGenerator.js';
import { AppError } from '../utils/errors.js';

const toDoc = doc => ({ id: doc.id, ...doc.data() });

export const listMedicine = asyncHandler(async (req, res) => {
  const snap = await collectionRefs.medicine().where('userId', '==', req.user.uid).get();
  const medicine = snap.docs.map(toDoc);
  medicine.sort((a, b) => {
    const d1 = new Date(a.date).getTime() || 0;
    const d2 = new Date(b.date).getTime() || 0;
    return d2 - d1;
  });
  res.json({ medicine });
});

export const createMedicine = asyncHandler(async (req, res) => {
  const payload = medicineSchema.parse(req.body);
  if (payload.animalId) {
    const animals = await collectionRefs.animals().where('animalId', '==', payload.animalId).limit(1).get();
    if (animals.empty) throw new AppError('Animal not found for this medicine record', 404);
  }

  const id = await nextDocId('medicine');
  const doc = {
    medicineId: id,
    ...payload,
    userId: req.user.uid,
    createdAt: new Date().toISOString()
  };
  const ref = collectionRefs.medicine().doc();
  await ref.set(doc);
  res.status(201).json({ message: 'Medicine record created', medicine: { id: ref.id, ...doc } });
});

export const updateMedicine = asyncHandler(async (req, res) => {
  const existing = await collectionRefs.medicine().doc(req.params.id).get();
  if (!existing.exists) throw new AppError('Medicine record not found', 404);
  if (existing.data().userId && existing.data().userId !== req.user.uid) throw new AppError('Not authorized', 403);
  const payload = medicineSchema.partial().parse(req.body);
  await collectionRefs.medicine().doc(req.params.id).set(payload, { merge: true });
  const updated = await collectionRefs.medicine().doc(req.params.id).get();
  res.json({ message: 'Medicine updated', medicine: toDoc(updated) });
});

export const deleteMedicine = asyncHandler(async (req, res) => {
  const existing = await collectionRefs.medicine().doc(req.params.id).get();
  if (!existing.exists) throw new AppError('Medicine record not found', 404);
  if (existing.data().userId && existing.data().userId !== req.user.uid) throw new AppError('Not authorized', 403);
  await collectionRefs.medicine().doc(req.params.id).delete();
  res.json({ message: 'Medicine deleted' });
});
