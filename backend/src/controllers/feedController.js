import { asyncHandler } from '../utils/asyncHandler.js';
import { collectionRefs } from '../services/firestore.js';
import { feedSchema } from '../utils/validators.js';
import { nextDocId } from '../services/idGenerator.js';
import { AppError } from '../utils/errors.js';

const toDoc = doc => ({ id: doc.id, ...doc.data() });

export const listFeed = asyncHandler(async (req, res) => {
  const snap = await collectionRefs.feed().orderBy('date', 'desc').get();
  res.json({ feed: snap.docs.map(toDoc) });
});

export const createFeed = asyncHandler(async (req, res) => {
  const payload = feedSchema.parse(req.body);
  const totalCost = Number(payload.quantity) * Number(payload.pricePerUnit);
  const id = await nextDocId('feed');
  const doc = {
    feedId: id,
    ...payload,
    totalCost,
    createdAt: new Date().toISOString()
  };
  const ref = collectionRefs.feed().doc();
  await ref.set(doc);
  res.status(201).json({ message: 'Feed record created', feed: { id: ref.id, ...doc } });
});

export const updateFeed = asyncHandler(async (req, res) => {
  const existing = await collectionRefs.feed().doc(req.params.id).get();
  if (!existing.exists) throw new AppError('Feed record not found', 404);
  const payload = feedSchema.partial().parse(req.body);
  await collectionRefs.feed().doc(req.params.id).set(payload, { merge: true });
  const updated = await collectionRefs.feed().doc(req.params.id).get();
  res.json({ message: 'Feed updated', feed: toDoc(updated) });
});

export const deleteFeed = asyncHandler(async (req, res) => {
  const existing = await collectionRefs.feed().doc(req.params.id).get();
  if (!existing.exists) throw new AppError('Feed record not found', 404);
  await collectionRefs.feed().doc(req.params.id).delete();
  res.json({ message: 'Feed deleted' });
});
