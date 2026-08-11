import { asyncHandler } from '../utils/asyncHandler.js';
import { collectionRefs } from '../services/firestore.js';
import { saleSchema } from '../utils/validators.js';
import { AppError } from '../utils/errors.js';
import { nextDocId } from '../services/idGenerator.js';
import { safeDate } from '../utils/calculations.js';

const toDoc = doc => ({ id: doc.id, ...doc.data() });

export const listSales = asyncHandler(async (req, res) => {
  const snap = await collectionRefs.sales().orderBy('saleDate', 'desc').get();
  res.json({ sales: snap.docs.map(toDoc) });
});

export const createSale = asyncHandler(async (req, res) => {
  const payload = saleSchema.parse(req.body);
  const saleDate = safeDate(payload.saleDate);
  if (!saleDate) throw new AppError('Invalid sale date', 400);

  const animalQuery = await collectionRefs.animals().where('animalId', '==', payload.animalId).limit(1).get();
  if (animalQuery.empty) throw new AppError('Animal not found', 404);

  const animalDoc = animalQuery.docs[0];
  const animal = animalDoc.data();
  if (animal.status === 'Sold') {
    throw new AppError('Animal already sold', 400);
  }

  const purchaseDate = safeDate(animal.purchaseDate);
  if (purchaseDate && saleDate < purchaseDate) {
    throw new AppError('Sale date cannot be before purchase date', 400);
  }

  const existingSale = await collectionRefs.sales().where('animalId', '==', payload.animalId).limit(1).get();
  if (!existingSale.empty) {
    throw new AppError('This animal has already been sold', 400);
  }

  const id = await nextDocId('sale');
  const doc = {
    saleId: id,
    ...payload,
    saleDate: saleDate.toISOString(),
    createdAt: new Date().toISOString()
  };

  const saleRef = collectionRefs.sales().doc();
  await saleRef.set(doc);
  await collectionRefs.animals().doc(animalDoc.id).set({
    status: 'Sold',
    soldAt: saleDate.toISOString(),
    salePrice: Number(payload.salePrice),
    buyerName: payload.buyerName
  }, { merge: true });

  res.status(201).json({ message: 'Sale recorded and animal marked as sold', sale: { id: saleRef.id, ...doc } });
});

export const updateSale = asyncHandler(async (req, res) => {
  const existing = await collectionRefs.sales().doc(req.params.id).get();
  if (!existing.exists) throw new AppError('Sale not found', 404);
  const payload = saleSchema.partial().parse(req.body);
  await collectionRefs.sales().doc(req.params.id).set(payload, { merge: true });
  const updated = await collectionRefs.sales().doc(req.params.id).get();
  res.json({ message: 'Sale updated', sale: toDoc(updated) });
});

export const deleteSale = asyncHandler(async (req, res) => {
  const existing = await collectionRefs.sales().doc(req.params.id).get();
  if (!existing.exists) throw new AppError('Sale not found', 404);
  const sale = existing.data();
  const animalQuery = await collectionRefs.animals().where('animalId', '==', sale.animalId).limit(1).get();
  if (!animalQuery.empty) {
    await collectionRefs.animals().doc(animalQuery.docs[0].id).set({
      status: 'Available',
      salePrice: 0,
      buyerName: '',
      soldAt: null
    }, { merge: true });
  }
  await collectionRefs.sales().doc(req.params.id).delete();
  res.json({ message: 'Sale deleted' });
});
