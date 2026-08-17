import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { collectionRefs } from '../services/firestore.js';
import { nextAnimalId } from '../services/idGenerator.js';
import { animalSchema, birthSchema, breedingSchema } from '../utils/validators.js';
import { safeDate } from '../utils/calculations.js';

const toAnimal = doc => ({ id: doc.id, ...doc.data() });

const GESTATION_DAYS = { Cow: 283, Goat: 150 };
const DAY_MS = 24 * 60 * 60 * 1000;

const dateOnly = value => {
  const date = safeDate(value);
  if (!date) return null;
  return date.toISOString().slice(0, 10);
};

const expectedBirthDate = (breedingDate, type) => {
  const days = GESTATION_DAYS[type];
  const start = safeDate(breedingDate);
  if (!days || !start) return null;
  const expected = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + days));
  return expected.toISOString().slice(0, 10);
};

const withBreedingStatus = record => {
  if (record.actualBirthDate) return { ...record, status: 'Birth recorded' };
  const expected = safeDate(record.expectedBirthDate);
  if (!expected) return record;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const expectedUtc = Date.UTC(expected.getUTCFullYear(), expected.getUTCMonth(), expected.getUTCDate());
  const remainingDays = Math.ceil((expectedUtc - todayUtc) / DAY_MS);
  const status = remainingDays > 0 ? 'Pregnant / Expecting' : remainingDays === 0 ? 'Due Today' : 'Overdue';
  return { ...record, remainingDays, status };
};

export const listAnimals = asyncHandler(async (req, res) => {
  const snapshot = await collectionRefs.animals().where('userId', '==', req.user.uid).get();
  let animals = snapshot.docs.map(toAnimal);
  const { q, type, gender, status, breed, sortBy = 'createdAt', order = 'desc' } = req.query;

  if (q) {
    const query = q.toLowerCase();
    animals = animals.filter(animal =>
      [animal.animalId, animal.name, animal.breed, animal.color, animal.status]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query))
    );
  }

  if (type) animals = animals.filter(animal => animal.type === type);
  if (gender) animals = animals.filter(animal => animal.gender === gender);
  if (status) animals = animals.filter(animal => animal.status === status);
  if (breed) animals = animals.filter(animal => String(animal.breed).toLowerCase().includes(String(breed).toLowerCase()));

  animals.sort((a, b) => {
    const left = a[sortBy];
    const right = b[sortBy];
    if (left === right) return 0;
    const comparison = left > right ? 1 : -1;
    return order === 'asc' ? comparison : -comparison;
  });

  // Include live pregnancy status in the list response so the Pregnancy page can
  // show every saved record without making a separate request per animal.
  res.json({
    animals: animals.map(animal => ({
      ...animal,
      breedingHistory: (animal.breedingHistory || []).map(withBreedingStatus)
    }))
  });
});

export const getAnimal = asyncHandler(async (req, res) => {
  const animalDoc = await collectionRefs.animals().doc(req.params.id).get();
  if (!animalDoc.exists) {
    throw new AppError('Animal not found', 404);
  }

  const animal = animalDoc.data();
  if (animal.userId && animal.userId !== req.user.uid) {
    throw new AppError('Not authorized', 403);
  }
  const [expensesSnap, feedSnap, medicineSnap, saleSnap] = await Promise.all([
    collectionRefs.expenses().where('animalId', '==', animal.animalId).get(),
    collectionRefs.feed().where('animalId', '==', animal.animalId).get(),
    collectionRefs.medicine().where('animalId', '==', animal.animalId).get(),
    collectionRefs.sales().where('animalId', '==', animal.animalId).limit(1).get()
  ]);

  const expenses = expensesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const feed = feedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const medicine = medicineSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const sale = saleSnap.docs[0] ? { id: saleSnap.docs[0].id, ...saleSnap.docs[0].data() } : null;

  const breedingHistory = (animal.breedingHistory || []).map(withBreedingStatus);
  res.json({
    animal: {
      id: animalDoc.id,
      ...animal,
      breedingHistory,
      details: {
        expenses,
        feed,
        medicine,
        sale
      }
    }
  });
});

export const recordBreeding = asyncHandler(async (req, res) => {
  const animalDoc = await collectionRefs.animals().doc(req.params.id).get();
  if (!animalDoc.exists) throw new AppError('Animal not found', 404);

  const animal = animalDoc.data();
  if (animal.userId && animal.userId !== req.user.uid) throw new AppError('Not authorized', 403);

  if (animal.gender !== 'Female' || !GESTATION_DAYS[animal.type]) {
    throw new AppError('Breeding records are available only for female cows and goats', 400);
  }

  const payload = breedingSchema.parse(req.body);
  const breedingDate = dateOnly(payload.breedingDate);
  if (!breedingDate) throw new AppError('Invalid breeding date', 400);

  const record = {
    id: `breeding-${Date.now()}`,
    breedingDate,
    animalType: animal.type,
    gestationDays: GESTATION_DAYS[animal.type],
    expectedBirthDate: expectedBirthDate(breedingDate, animal.type),
    notes: payload.notes || null,
    createdAt: new Date().toISOString()
  };
  const breedingHistory = [...(animal.breedingHistory || []), record];
  await animalDoc.ref.set({ breedingHistory, updatedAt: new Date().toISOString() }, { merge: true });
  res.status(201).json({ message: 'Breeding record saved', breeding: withBreedingStatus(record) });
});

export const updateBreeding = asyncHandler(async (req, res) => {
  const animalDoc = await collectionRefs.animals().doc(req.params.id).get();
  if (!animalDoc.exists) throw new AppError('Animal not found', 404);

  const animal = animalDoc.data();
  if (animal.userId && animal.userId !== req.user.uid) throw new AppError('Not authorized', 403);

  const recordIndex = (animal.breedingHistory || []).findIndex(record => record.id === req.params.breedingId);
  if (recordIndex < 0) throw new AppError('Breeding record not found', 404);

  const payload = breedingSchema.parse(req.body);
  const breedingDate = dateOnly(payload.breedingDate);
  if (!breedingDate) throw new AppError('Invalid breeding date', 400);

  const breedingHistory = [...animal.breedingHistory];
  breedingHistory[recordIndex] = {
    ...breedingHistory[recordIndex],
    breedingDate,
    expectedBirthDate: expectedBirthDate(breedingDate, animal.type),
    notes: payload.notes || null,
    updatedAt: new Date().toISOString()
  };
  await animalDoc.ref.set({ breedingHistory, updatedAt: new Date().toISOString() }, { merge: true });
  res.json({ message: 'Breeding record updated', breeding: withBreedingStatus(breedingHistory[recordIndex]) });
});

export const deleteBreeding = asyncHandler(async (req, res) => {
  const animalDoc = await collectionRefs.animals().doc(req.params.id).get();
  if (!animalDoc.exists) throw new AppError('Animal not found', 404);

  const animal = animalDoc.data();
  if (animal.userId && animal.userId !== req.user.uid) throw new AppError('Not authorized', 403);

  const breedingHistory = animal.breedingHistory || [];
  const remainingHistory = breedingHistory.filter(record => record.id !== req.params.breedingId);
  if (remainingHistory.length === breedingHistory.length) throw new AppError('Breeding record not found', 404);

  await animalDoc.ref.set({ breedingHistory: remainingHistory, updatedAt: new Date().toISOString() }, { merge: true });
  res.json({ message: 'Breeding record deleted' });
});

export const recordBirth = asyncHandler(async (req, res) => {
  const animalDoc = await collectionRefs.animals().doc(req.params.id).get();
  if (!animalDoc.exists) throw new AppError('Animal not found', 404);
  
  if (animalDoc.data().userId && animalDoc.data().userId !== req.user.uid) throw new AppError('Not authorized', 403);

  const payload = birthSchema.parse(req.body);
  const actualBirthDate = dateOnly(payload.actualBirthDate);
  if (!actualBirthDate) throw new AppError('Invalid birth date', 400);

  const breedingHistory = animalDoc.data().breedingHistory || [];
  const recordIndex = breedingHistory.findIndex(record => record.id === req.params.breedingId);
  if (recordIndex < 0) throw new AppError('Breeding record not found', 404);
  if (breedingHistory[recordIndex].actualBirthDate) throw new AppError('Birth is already recorded for this breeding', 400);

  breedingHistory[recordIndex] = {
    ...breedingHistory[recordIndex],
    actualBirthDate,
    birthNotes: payload.notes || null,
    completedAt: new Date().toISOString()
  };
  await animalDoc.ref.set({ breedingHistory, updatedAt: new Date().toISOString() }, { merge: true });
  res.json({ message: 'Birth recorded', breeding: withBreedingStatus(breedingHistory[recordIndex]) });
});

export const createAnimal = asyncHandler(async (req, res) => {
  const payload = animalSchema.parse(req.body);
  const animalId = await nextAnimalId();
  const createdAt = new Date().toISOString();
  let purchaseDateStr = null;
  if (!payload.isSelfBreed) {
    const purchaseDate = safeDate(payload.purchaseDate);
    if (!purchaseDate) {
      throw new AppError('Invalid purchase date', 400);
    }
    purchaseDateStr = purchaseDate.toISOString();
  }

  const docRef = collectionRefs.animals().doc();
  const animal = {
    ...payload,
    animalId,
    purchaseDate: purchaseDateStr,
    dob: payload.dob ? safeDate(payload.dob)?.toISOString() || null : null,
    createdAt,
    updatedAt: createdAt,
    status: payload.status || 'Available',
    userId: req.user.uid,
    purchasedBy: req.user.uid
  };

  await docRef.set(animal);
  res.status(201).json({ message: 'Animal created', animal: { id: docRef.id, ...animal } });
});

export const updateAnimal = asyncHandler(async (req, res) => {
  const existingDoc = await collectionRefs.animals().doc(req.params.id).get();
  if (!existingDoc.exists) throw new AppError('Animal not found', 404);

  const existing = existingDoc.data();
  if (existing.userId && existing.userId !== req.user.uid) throw new AppError('Not authorized', 403);

  const incoming = animalSchema.partial().parse(req.body);
  const updates = {
    ...incoming,
    updatedAt: new Date().toISOString()
  };

  if (incoming.purchaseDate) {
    const date = safeDate(incoming.purchaseDate);
    if (!date) throw new AppError('Invalid purchase date', 400);
    updates.purchaseDate = date.toISOString();
  }

  if (incoming.dob) {
    const date = safeDate(incoming.dob);
    updates.dob = date ? date.toISOString() : null;
  }

  if (incoming.status === 'Sold' && existing.status === 'Sold') {
    throw new AppError('Animal already sold', 400);
  }

  await collectionRefs.animals().doc(req.params.id).set(updates, { merge: true });
  const updated = await collectionRefs.animals().doc(req.params.id).get();

  res.json({ message: 'Animal updated', animal: { id: updated.id, ...updated.data() } });
});

export const deleteAnimal = asyncHandler(async (req, res) => {
  const existingDoc = await collectionRefs.animals().doc(req.params.id).get();
  if (!existingDoc.exists) throw new AppError('Animal not found', 404);
  if (existingDoc.data().userId && existingDoc.data().userId !== req.user.uid) throw new AppError('Not authorized', 403);

  await collectionRefs.animals().doc(req.params.id).delete();
  res.json({ message: 'Animal deleted' });
});

export const animalSummary = asyncHandler(async (req, res) => {
  const animalDoc = await collectionRefs.animals().doc(req.params.id).get();
  if (!animalDoc.exists) throw new AppError('Animal not found', 404);

  const animal = animalDoc.data();
  if (animal.userId && animal.userId !== req.user.uid) throw new AppError('Not authorized', 403);

  const [expensesSnap, feedSnap, medicineSnap, saleSnap] = await Promise.all([
    collectionRefs.expenses().where('animalId', '==', animal.animalId).get(),
    collectionRefs.feed().where('animalId', '==', animal.animalId).get(),
    collectionRefs.medicine().where('animalId', '==', animal.animalId).get(),
    collectionRefs.sales().where('animalId', '==', animal.animalId).limit(1).get()
  ]);

  const expenses = expensesSnap.docs.map(doc => doc.data());
  const feed = feedSnap.docs.map(doc => doc.data());
  const medicine = medicineSnap.docs.map(doc => doc.data());
  const sale = saleSnap.docs[0]?.data() || null;

  const feedCost = feed.reduce((sum, item) => sum + Number(item.totalCost || item.amount || 0), 0);
  const medicineCost = medicine.reduce((sum, item) => sum + Number(item.cost || item.amount || 0), 0);
  const otherCost = expenses.filter(item => !['Feed', 'Medicine', 'Veterinary', 'Vaccination', 'Transportation'].includes(item.category)).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const transportCost = expenses.filter(item => item.category === 'Transportation').reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalInvestment = Number(animal.purchasePrice || 0) + feedCost + medicineCost + otherCost + transportCost;
  const salePrice = Number(sale?.salePrice || 0);
  const netProfit = salePrice - totalInvestment;
  const daysKept = safeDate(animal.purchaseDate) ? Math.ceil((Date.now() - new Date(animal.purchaseDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  res.json({
    animalId: animal.animalId,
    type: animal.type,
    gender: animal.gender,
    purchaseCost: Number(animal.purchasePrice || 0),
    feedCost,
    medicineCost,
    transportCost,
    otherCost,
    totalInvestment,
    salePrice,
    netProfit,
    roi: totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0,
    profitMargin: salePrice > 0 ? (netProfit / salePrice) * 100 : 0,
    daysKept
  });
});
