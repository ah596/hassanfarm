import { asyncHandler } from '../utils/asyncHandler.js';
import { collectionRefs } from '../services/firestore.js';
import { buildSummary, monthKey, toNumber } from '../utils/calculations.js';

const toDoc = doc => ({ id: doc.id, ...doc.data() });

export const profitReport = asyncHandler(async (req, res) => {
  const [animalsSnap, expensesSnap, feedSnap, medicineSnap, salesSnap] = await Promise.all([
    collectionRefs.animals().where('userId', '==', req.user.uid).get(),
    collectionRefs.expenses().where('userId', '==', req.user.uid).get(),
    collectionRefs.feed().where('userId', '==', req.user.uid).get(),
    collectionRefs.medicine().where('userId', '==', req.user.uid).get(),
    collectionRefs.sales().where('userId', '==', req.user.uid).get()
  ]);

  const summary = buildSummary(
    animalsSnap.docs.map(toDoc),
    expensesSnap.docs.map(toDoc),
    salesSnap.docs.map(toDoc),
    feedSnap.docs.map(toDoc),
    medicineSnap.docs.map(toDoc)
  );

  const rows = summary.animalFinancials.map(animal => ({
    animalId: animal.animalId,
    type: animal.type,
    gender: animal.gender,
    purchasePrice: animal.purchasePrice,
    feed: animal.financials.feedCost,
    medicine: animal.financials.medicineCost,
    otherCost: animal.financials.otherCost + animal.financials.transportCost,
    totalCost: animal.financials.totalCost,
    salePrice: animal.financials.status === 'Profit' || animal.financials.status === 'Loss' || animal.financials.status === 'Break Even' ? animal.financials.totalCost + animal.financials.netProfit : 0,
    profitLoss: animal.financials.netProfit,
    status: animal.financials.status
  }));

  res.json({
    rows,
    summary: summary.profitSummary
  });
});

export const salesReport = asyncHandler(async (req, res) => {
  const [salesSnap, animalsSnap, expensesSnap, feedSnap, medicineSnap] = await Promise.all([
    collectionRefs.sales().where('userId', '==', req.user.uid).get(),
    collectionRefs.animals().where('userId', '==', req.user.uid).get(),
    collectionRefs.expenses().where('userId', '==', req.user.uid).get(),
    collectionRefs.feed().where('userId', '==', req.user.uid).get(),
    collectionRefs.medicine().where('userId', '==', req.user.uid).get()
  ]);
  const animals = animalsSnap.docs.map(toDoc);
  const expenses = expensesSnap.docs.map(toDoc);
  const feed = feedSnap.docs.map(toDoc);
  const medicine = medicineSnap.docs.map(toDoc);
  const animalMap = buildSummary(animals, expenses, salesSnap.docs.map(toDoc), feed, medicine).animalFinancials;
  const financialByAnimalId = new Map(animalMap.map(item => [item.animalId, item.financials]));
  const rows = salesSnap.docs.map(doc => {
    const sale = doc.data();
    const financials = financialByAnimalId.get(sale.animalId);
    return {
      animalId: sale.animalId,
      saleDate: sale.saleDate,
      salePrice: sale.salePrice,
      buyerName: sale.buyerName,
      profit: financials ? financials.netProfit : toNumber(sale.salePrice)
    };
  });

  res.json({ rows });
});

export const expenseReport = asyncHandler(async (req, res) => {
  const [expensesSnap, animalsSnap] = await Promise.all([
    collectionRefs.expenses().where('userId', '==', req.user.uid).get(),
    collectionRefs.animals().where('userId', '==', req.user.uid).get()
  ]);
  const animalsById = new Map(animalsSnap.docs.map(doc => [doc.data().animalId, doc.data()]));
  const rows = expensesSnap.docs.map(doc => {
    const expense = doc.data();
    return {
      date: expense.date,
      category: expense.category,
      animal: expense.animalId ? animalsById.get(expense.animalId)?.animalId || expense.animalId : 'Farm',
      amount: expense.amount,
      description: expense.description || ''
    };
  });

  res.json({ rows });
});

export const monthlyProfitReport = asyncHandler(async (req, res) => {
  const [animalsSnap, expensesSnap, feedSnap, medicineSnap, salesSnap] = await Promise.all([
    collectionRefs.animals().where('userId', '==', req.user.uid).get(),
    collectionRefs.expenses().where('userId', '==', req.user.uid).get(),
    collectionRefs.feed().where('userId', '==', req.user.uid).get(),
    collectionRefs.medicine().where('userId', '==', req.user.uid).get(),
    collectionRefs.sales().where('userId', '==', req.user.uid).get()
  ]);

  const rows = {};
  for (const doc of animalsSnap.docs) {
    const animal = doc.data();
    const key = monthKey(animal.purchaseDate);
    rows[key] ||= { month: key, purchases: 0, expenses: 0, sales: 0, profit: 0 };
    rows[key].purchases += toNumber(animal.purchasePrice);
  }
  for (const doc of expensesSnap.docs) {
    const item = doc.data();
    const key = monthKey(item.date);
    rows[key] ||= { month: key, purchases: 0, expenses: 0, sales: 0, profit: 0 };
    rows[key].expenses += toNumber(item.amount);
  }
  for (const doc of feedSnap.docs) {
    const item = doc.data();
    const key = monthKey(item.date);
    rows[key] ||= { month: key, purchases: 0, expenses: 0, sales: 0, profit: 0 };
    rows[key].expenses += toNumber(item.totalCost || item.amount);
  }
  for (const doc of medicineSnap.docs) {
    const item = doc.data();
    const key = monthKey(item.date);
    rows[key] ||= { month: key, purchases: 0, expenses: 0, sales: 0, profit: 0 };
    rows[key].expenses += toNumber(item.cost || item.amount);
  }
  for (const doc of salesSnap.docs) {
    const item = doc.data();
    const key = monthKey(item.saleDate);
    rows[key] ||= { month: key, purchases: 0, expenses: 0, sales: 0, profit: 0 };
    rows[key].sales += toNumber(item.salePrice);
  }

  const output = Object.values(rows).map(row => ({
    ...row,
    profit: row.sales - row.purchases - row.expenses
  })).sort((a, b) => a.month.localeCompare(b.month));

  res.json({ rows: output });
});
