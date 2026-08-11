export const toNumber = value => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

export const safeDate = value => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function daysBetween(start, end = new Date()) {
  const a = safeDate(start);
  const b = safeDate(end);
  if (!a || !b) return 0;
  const diff = b.getTime() - a.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function computeFinancials({ purchasePrice = 0, expenses = [], salePrice = 0 }) {
  const feedCost = expenses.filter(item => item.category === 'Feed').reduce((sum, item) => sum + toNumber(item.amount), 0);
  const medicineCost = expenses.filter(item => ['Medicine', 'Veterinary', 'Vaccination'].includes(item.category)).reduce((sum, item) => sum + toNumber(item.amount), 0);
  const transportCost = expenses.filter(item => item.category === 'Transportation').reduce((sum, item) => sum + toNumber(item.amount), 0);
  const otherCost = expenses.filter(item => !['Feed', 'Medicine', 'Veterinary', 'Vaccination', 'Transportation'].includes(item.category)).reduce((sum, item) => sum + toNumber(item.amount), 0);
  const totalCost = toNumber(purchasePrice) + feedCost + medicineCost + transportCost + otherCost;
  const netProfit = toNumber(salePrice) - totalCost;
  const status = netProfit > 0 ? 'Profit' : netProfit < 0 ? 'Loss' : 'Break Even';
  const profitMargin = salePrice > 0 ? (netProfit / toNumber(salePrice)) * 100 : 0;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

  return {
    feedCost,
    medicineCost,
    transportCost,
    otherCost,
    totalCost,
    netProfit,
    status,
    profitMargin,
    roi
  };
}

export function monthKey(dateInput) {
  const date = safeDate(dateInput);
  if (!date) return 'Unknown';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function buildSummary(animals = [], expenses = [], sales = [], feed = [], medicine = []) {
  const totalAnimals = animals.length;
  const maleGoats = animals.filter(animal => animal.gender === 'Male').length;
  const femaleGoats = animals.filter(animal => animal.gender === 'Female').length;
  const soldAnimals = animals.filter(animal => animal.status === 'Sold').length;
  const availableAnimals = animals.filter(animal => animal.status === 'Available').length;

  const animalById = new Map(animals.map(animal => [animal.id, animal]));

  const groupedExpenses = new Map();
  for (const item of expenses) {
    const key = item.animalId || 'farm';
    if (!groupedExpenses.has(key)) groupedExpenses.set(key, []);
    groupedExpenses.get(key).push(item);
  }

  const groupedFeed = new Map();
  for (const item of feed) {
    const key = item.animalId || 'farm';
    if (!groupedFeed.has(key)) groupedFeed.set(key, []);
    groupedFeed.get(key).push(item);
  }

  const groupedMedicine = new Map();
  for (const item of medicine) {
    const key = item.animalId || 'farm';
    if (!groupedMedicine.has(key)) groupedMedicine.set(key, []);
    groupedMedicine.get(key).push(item);
  }

  const animalFinancials = animals.map(animal => {
    const key = animal.animalId;
    const animalExpenses = [
      ...(groupedExpenses.get(key) || []),
      ...(groupedFeed.get(key) || []),
      ...(groupedMedicine.get(key) || [])
    ];
    const sale = sales.find(entry => entry.animalId === key) || null;
    return {
      ...animal,
      financials: computeFinancials({
        purchasePrice: animal.purchasePrice,
        expenses: animalExpenses,
        salePrice: sale?.salePrice || 0
      })
    };
  });

  const totalPurchasedAmount = animals.reduce((sum, animal) => sum + toNumber(animal.purchasePrice), 0);
  const totalFeedExpenses = feed.reduce((sum, item) => sum + toNumber(item.totalCost ?? item.amount), 0);
  const totalMedicineExpenses = medicine.reduce((sum, item) => sum + toNumber(item.cost ?? item.amount), 0);
  const totalOtherExpenses = expenses
    .filter(item => !['Feed', 'Medicine', 'Veterinary', 'Vaccination', 'Transportation'].includes(item.category))
    .reduce((sum, item) => sum + toNumber(item.amount), 0);
  const totalInvestment = animals.reduce((sum, animal) => {
    const entry = animalFinancials.find(item => item.id === animal.id);
    return sum + (entry?.financials.totalCost || 0);
  }, 0);
  const totalSales = sales.reduce((sum, item) => sum + toNumber(item.salePrice), 0);
  const totalProfit = animalFinancials.reduce((sum, item) => sum + Math.max(0, item.financials.netProfit), 0);
  const totalLoss = Math.abs(animalFinancials.reduce((sum, item) => sum + Math.min(0, item.financials.netProfit), 0));
  const profitMargin = totalSales > 0 ? ((totalSales - totalInvestment) / totalSales) * 100 : 0;
  const netProfit = totalSales - totalInvestment;
  const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

  return {
    totalAnimals,
    maleGoats,
    femaleGoats,
    totalPurchasedAmount,
    totalFeedExpenses,
    totalMedicineExpenses,
    totalOtherExpenses,
    totalInvestment,
    totalSales,
    totalProfit,
    totalLoss,
    availableAnimals,
    soldAnimals,
    profitSummary: {
      totalInvestment,
      totalRevenue: totalSales,
      netProfit,
      profitMargin,
      roi
    },
    animalFinancials,
    animalById
  };
}
