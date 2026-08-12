import { asyncHandler } from '../utils/asyncHandler.js';
import { collectionRefs } from '../services/firestore.js';
import { buildSummary, monthKey, toNumber } from '../utils/calculations.js';

async function fetchAll(userId) {
  const [animals, expenses, feed, medicine, sales] = await Promise.all([
    collectionRefs.animals().where('userId', '==', userId).select('animalId', 'type', 'gender', 'status', 'purchasePrice', 'purchaseDate').get(),
    collectionRefs.expenses().where('userId', '==', userId).get(),
    collectionRefs.feed().where('userId', '==', userId).get(),
    collectionRefs.medicine().where('userId', '==', userId).get(),
    collectionRefs.sales().where('userId', '==', userId).get()
  ]);

  return {
    animals: animals.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    expenses: expenses.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    feed: feed.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    medicine: medicine.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    sales: sales.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  };
}

export const getDashboard = asyncHandler(async (req, res) => {
  const data = await fetchAll(req.user.uid);
  const summary = buildSummary(data.animals, data.expenses, data.sales, data.feed, data.medicine);

  const buckets = {
    monthlyPurchases: {},
    monthlySales: {},
    monthlyExpenses: {},
    monthlyProfit: {},
    maleVsFemale: {
      Male: summary.maleGoats,
      Female: summary.femaleGoats
    },
    soldVsAvailable: {
      Sold: summary.soldAnimals,
      Available: summary.availableAnimals
    }
  };

  for (const animal of data.animals) {
    const key = monthKey(animal.purchaseDate);
    buckets.monthlyPurchases[key] = (buckets.monthlyPurchases[key] || 0) + toNumber(animal.purchasePrice);
  }

  for (const sale of data.sales) {
    const key = monthKey(sale.saleDate);
    buckets.monthlySales[key] = (buckets.monthlySales[key] || 0) + toNumber(sale.salePrice);
  }

  for (const expense of data.expenses) {
    const key = monthKey(expense.date);
    buckets.monthlyExpenses[key] = (buckets.monthlyExpenses[key] || 0) + toNumber(expense.amount);
  }

  const monthlyTotals = {};
  for (const animal of data.animals) {
    const key = monthKey(animal.purchaseDate);
    monthlyTotals[key] ||= { purchases: 0, expenses: 0, feed: 0, medicine: 0, sales: 0 };
    monthlyTotals[key].purchases += toNumber(animal.purchasePrice);
  }
  for (const expense of data.expenses) {
    const key = monthKey(expense.date);
    monthlyTotals[key] ||= { purchases: 0, expenses: 0, feed: 0, medicine: 0, sales: 0 };
    monthlyTotals[key].expenses += toNumber(expense.amount);
  }
  for (const item of data.feed) {
    const key = monthKey(item.date);
    monthlyTotals[key] ||= { purchases: 0, expenses: 0, feed: 0, medicine: 0, sales: 0 };
    monthlyTotals[key].feed += toNumber(item.totalCost || item.amount);
  }
  for (const item of data.medicine) {
    const key = monthKey(item.date);
    monthlyTotals[key] ||= { purchases: 0, expenses: 0, feed: 0, medicine: 0, sales: 0 };
    monthlyTotals[key].medicine += toNumber(item.cost || item.amount);
  }
  for (const sale of data.sales) {
    const key = monthKey(sale.saleDate);
    monthlyTotals[key] ||= { purchases: 0, expenses: 0, feed: 0, medicine: 0, sales: 0 };
    monthlyTotals[key].sales += toNumber(sale.salePrice);
  }

  for (const [key, values] of Object.entries(monthlyTotals)) {
    buckets.monthlyProfit[key] = values.sales - (values.purchases + values.expenses + values.feed + values.medicine);
  }

  res.json({
    summary,
    charts: buckets
  });
});
