import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { collectionRefs } from '../services/firestore.js';
import { cropActivitySchema, cropSaleSchema, cropSeasonSchema, cropYieldSchema } from '../utils/validators.js';

const toDoc = doc => ({ id: doc.id, ...doc.data() });
const amount = value => Number(value) || 0;
// Filter ownership after the season query to avoid requiring a Firestore
// composite index before a user can start using the new crop module.
const listForSeason = async (ref, seasonId, uid) => (await ref().where('seasonId', '==', seasonId).get()).docs.map(toDoc).filter(item => item.userId === uid);
const ensureSeason = async (id, uid) => {
  const snap = await collectionRefs.cropSeasons().doc(id).get();
  if (!snap.exists) throw new AppError('Crop season not found', 404);
  if (snap.data().userId !== uid) throw new AppError('Not authorized', 403);
  return { id: snap.id, ...snap.data() };
};
const byNewestDate = (a, b) => String(b.date || b.saleDate || '').localeCompare(String(a.date || a.saleDate || ''));
const prepareActivity = payload => {
  const details = { ...(payload.details || {}) };
  let totalCost = amount(payload.totalCost);

  if (payload.type === 'Land Preparation') {
    const area = amount(details.totalArea);
    const rounds = amount(details.rounds);
    const rate = amount(details.rate);
    const rateType = details.rateType;
    if (!details.activityName || !rateType || !rate) throw new AppError('Land preparation activity, rate type, and rate are required', 400);
    if (rateType === 'Per Acre') totalCost = area * rate;
    if (rateType === 'Per Round') totalCost = rounds * rate;
    if (rateType === 'Per Hour') totalCost = amount(details.hours) * rate;
    if (rateType === 'Fixed Price') totalCost = rate;
    details.totalArea = area;
    details.rounds = rounds;
    details.hours = amount(details.hours);
    details.rate = rate;
    details.rateType = rateType;
    details.areaUnit = details.areaUnit || 'Acre';
  }

  if (payload.type === 'Fertilizer') {
    const bags = amount(details.bags);
    const pricePerBag = amount(details.pricePerBag);
    const labourCost = amount(details.labourCost);
    if (!details.applicationNumber) throw new AppError('Application number is required', 400);
    details.bags = bags;
    details.weightPerBag = amount(details.weightPerBag);
    details.pricePerBag = pricePerBag;
    details.fertilizerCost = bags * pricePerBag;
    details.labourCost = labourCost;
    details.fertilizerType = details.fertilizerType || 'Other';
    totalCost = details.fertilizerCost + labourCost;
  }

  if (payload.type === 'Spray / Pesticide') {
    if (!details.applicationNumber) throw new AppError('Spray/application number is required', 400);
    if (!payload.date) throw new AppError('Spray date is required', 400);
    const products = Array.isArray(details.products) ? details.products : [];
    const productRowsTotal = products.reduce((sum, product) => sum + amount(product.price), 0);
    const productAmount = amount(details.productAmount) || productRowsTotal;
    const labourCost = amount(details.labourCost);
    const otherCost = amount(details.otherCost);
    details.products = products;
    details.productAmount = productAmount;
    details.labourCost = labourCost;
    details.otherCost = otherCost;
    totalCost = productAmount + labourCost + otherCost;
  }

  if (payload.type === 'Pesticide Application') {
    if (!details.applicationNumber) throw new AppError('Pesticide application number is required', 400);
    details.amount = amount(details.amount);
    totalCost = details.amount;
  }

  return { ...payload, details, totalCost, quantity: amount(payload.quantity) };
};

export const listSeasons = asyncHandler(async (req, res) => {
  const seasons = (await collectionRefs.cropSeasons().where('userId', '==', req.user.uid).get()).docs.map(toDoc);
  seasons.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  res.json({ seasons });
});

export const createSeason = asyncHandler(async (req, res) => {
  const payload = cropSeasonSchema.parse(req.body);
  const doc = { ...payload, rentCost: amount(payload.rentCost), userId: req.user.uid, createdAt: new Date().toISOString() };
  const ref = collectionRefs.cropSeasons().doc();
  await ref.set(doc);
  res.status(201).json({ season: { id: ref.id, ...doc } });
});

export const getSeason = asyncHandler(async (req, res) => res.json({ season: await ensureSeason(req.params.seasonId, req.user.uid) }));

export const updateSeason = asyncHandler(async (req, res) => {
  await ensureSeason(req.params.seasonId, req.user.uid);
  const payload = cropSeasonSchema.partial().parse(req.body);
  await collectionRefs.cropSeasons().doc(req.params.seasonId).set(payload, { merge: true });
  res.json({ season: await ensureSeason(req.params.seasonId, req.user.uid) });
});

export const deleteSeason = asyncHandler(async (req, res) => {
  await ensureSeason(req.params.seasonId, req.user.uid);
  const seasonId = req.params.seasonId;
  const groups = await Promise.all([collectionRefs.cropActivities().where('seasonId', '==', seasonId).get(), collectionRefs.cropYields().where('seasonId', '==', seasonId).get(), collectionRefs.cropSales().where('seasonId', '==', seasonId).get()]);
  for (const group of groups) await Promise.all(group.docs.map(doc => doc.ref.delete()));
  await collectionRefs.cropSeasons().doc(seasonId).delete();
  res.json({ message: 'Crop season deleted' });
});

export const listActivities = asyncHandler(async (req, res) => {
  await ensureSeason(req.params.seasonId, req.user.uid);
  const activities = await listForSeason(collectionRefs.cropActivities, req.params.seasonId, req.user.uid);
  activities.sort(byNewestDate);
  res.json({ activities });
});

export const createActivity = asyncHandler(async (req, res) => {
  await ensureSeason(req.params.seasonId, req.user.uid);
  const payload = cropActivitySchema.parse(req.body);
  const doc = { ...prepareActivity(payload), seasonId: req.params.seasonId, userId: req.user.uid, createdAt: new Date().toISOString() };
  const ref = collectionRefs.cropActivities().doc();
  await ref.set(doc);
  res.status(201).json({ activity: { id: ref.id, ...doc } });
});

export const updateActivity = asyncHandler(async (req, res) => {
  const existing = await collectionRefs.cropActivities().doc(req.params.recordId).get();
  if (!existing.exists || existing.data().userId !== req.user.uid || existing.data().seasonId !== req.params.seasonId) throw new AppError('Activity not found', 404);
  const payload = cropActivitySchema.parse(req.body);
  const doc = prepareActivity(payload);
  await existing.ref.set(doc, { merge: true });
  const updated = await existing.ref.get();
  res.json({ activity: toDoc(updated) });
});

export const deleteActivity = asyncHandler(async (req, res) => {
  const snap = await collectionRefs.cropActivities().doc(req.params.recordId).get();
  if (!snap.exists || snap.data().userId !== req.user.uid || snap.data().seasonId !== req.params.seasonId) throw new AppError('Activity not found', 404);
  await snap.ref.delete(); res.json({ message: 'Activity deleted' });
});

export const listYields = asyncHandler(async (req, res) => {
  await ensureSeason(req.params.seasonId, req.user.uid);
  const yields = await listForSeason(collectionRefs.cropYields, req.params.seasonId, req.user.uid); yields.sort(byNewestDate); res.json({ yields });
});
export const createYield = asyncHandler(async (req, res) => {
  await ensureSeason(req.params.seasonId, req.user.uid);
  const payload = cropYieldSchema.parse(req.body); const doc = { ...payload, totalProduction: amount(payload.totalProduction), calculatedProduction: amount(payload.calculatedProduction), seasonId: req.params.seasonId, userId: req.user.uid, createdAt: new Date().toISOString() };
  const ref = collectionRefs.cropYields().doc(); await ref.set(doc); res.status(201).json({ yield: { id: ref.id, ...doc } });
});
export const updateYield = asyncHandler(async (req, res) => {
  const existing = await collectionRefs.cropYields().doc(req.params.recordId).get();
  if (!existing.exists || existing.data().userId !== req.user.uid || existing.data().seasonId !== req.params.seasonId) throw new AppError('Harvest record not found', 404);
  const payload = cropYieldSchema.parse(req.body);
  await existing.ref.set({ ...payload, totalProduction: amount(payload.totalProduction), calculatedProduction: amount(payload.calculatedProduction) }, { merge: true });
  res.json({ yield: toDoc(await existing.ref.get()) });
});
export const deleteYield = asyncHandler(async (req, res) => {
  const snap = await collectionRefs.cropYields().doc(req.params.recordId).get(); if (!snap.exists || snap.data().userId !== req.user.uid || snap.data().seasonId !== req.params.seasonId) throw new AppError('Yield record not found', 404); await snap.ref.delete(); res.json({ message: 'Yield deleted' });
});

export const listSales = asyncHandler(async (req, res) => {
  await ensureSeason(req.params.seasonId, req.user.uid);
  const sales = await listForSeason(collectionRefs.cropSales, req.params.seasonId, req.user.uid); sales.sort(byNewestDate); res.json({ sales });
});
export const createSale = asyncHandler(async (req, res) => {
  await ensureSeason(req.params.seasonId, req.user.uid);
  const payload = cropSaleSchema.parse(req.body); const grossAmount = amount(payload.quantitySold) * amount(payload.ratePerUnit); const deductions = amount(payload.transportCost) + amount(payload.marketCharges) + amount(payload.commission) + amount(payload.otherDeduction); const doc = { ...payload, grossAmount, netSaleAmount: grossAmount - deductions, balance: grossAmount - amount(payload.amountReceived), seasonId: req.params.seasonId, userId: req.user.uid, createdAt: new Date().toISOString() };
  const ref = collectionRefs.cropSales().doc(); await ref.set(doc); res.status(201).json({ sale: { id: ref.id, ...doc } });
});
export const deleteSale = asyncHandler(async (req, res) => {
  const snap = await collectionRefs.cropSales().doc(req.params.recordId).get(); if (!snap.exists || snap.data().userId !== req.user.uid || snap.data().seasonId !== req.params.seasonId) throw new AppError('Sale record not found', 404); await snap.ref.delete(); res.json({ message: 'Sale deleted' });
});

export const cropDashboard = asyncHandler(async (req, res) => {
  const season = await ensureSeason(req.params.seasonId, req.user.uid);
  const [activities, yields, sales] = await Promise.all([listForSeason(collectionRefs.cropActivities, season.id, req.user.uid), listForSeason(collectionRefs.cropYields, season.id, req.user.uid), listForSeason(collectionRefs.cropSales, season.id, req.user.uid)]);
  const costsByType = Object.fromEntries(['Land Preparation', 'Seed / Sowing', 'Fertilizer', 'Spray / Pesticide', 'Pesticide Application', 'Irrigation', 'Labour', 'Machinery', 'Other Expense', 'Harvesting'].map(type => [type, activities.filter(a => a.type === type).reduce((sum, a) => sum + amount(a.totalCost), 0)]));
  const activityCost = activities.reduce((sum, item) => sum + amount(item.totalCost), 0);
  const rentCost = season.landOwnership === 'Rented / Theka' ? amount(season.rentCost) : 0;
  const totalInvestment = activityCost + rentCost;
  const totalProduction = yields.reduce((sum, item) => sum + amount(item.totalProduction), 0);
  const harvestTotals = yields.reduce((totals, item) => ({ ...totals, [item.unit || 'Unspecified']: (totals[item.unit || 'Unspecified'] || 0) + amount(item.totalProduction) }), {});
  const totalRevenue = sales.reduce((sum, item) => sum + amount(item.netSaleAmount), 0);
  const acres = season.areaUnit === 'Acre' ? amount(season.totalArea) : season.areaUnit === 'Kanal' ? amount(season.totalArea) / 8 : amount(season.totalArea) / 160;
  const landPreparationCost = costsByType['Land Preparation'];
  const fertilizerRecords = activities.filter(a => a.type === 'Fertilizer');
  const fertilizerCost = costsByType.Fertilizer;
  const sprayRecords = activities.filter(a => a.type === 'Spray / Pesticide');
  const pesticideRecords = activities.filter(a => a.type === 'Pesticide Application');
  const timeline = [...activities.map(a => ({ id: a.id, date: a.date, title: a.title, type: a.type, detail: a.quantity ? `${a.quantity} ${a.unit || ''}`.trim() : '' })), ...yields.map(y => ({ id: y.id, date: y.date, title: `${y.harvestNumber} yield recorded`, type: 'Yield', detail: `${y.totalProduction} ${y.unit}` })), ...sales.map(s => ({ id: s.id, date: s.saleDate, title: `Sold to ${s.buyerName}`, type: 'Sale', detail: `${s.quantitySold} ${s.unit}` }))].sort(byNewestDate);
  res.json({ season, activities, yields, sales, timeline, summary: { costsByType, totalInvestment, totalRevenue, netProfit: totalRevenue - totalInvestment, totalProduction, harvestTotals, acres, costPerAcre: acres ? totalInvestment / acres : 0, revenuePerAcre: acres ? totalRevenue / acres : 0, profitPerAcre: acres ? (totalRevenue - totalInvestment) / acres : 0, yieldPerAcre: acres ? totalProduction / acres : 0, roi: totalInvestment ? ((totalRevenue - totalInvestment) / totalInvestment) * 100 : 0, irrigationCount: activities.filter(a => a.type === 'Irrigation').length, landPreparation: { totalCost: landPreparationCost, costPerAcre: acres ? landPreparationCost / acres : 0, operations: activities.filter(a => a.type === 'Land Preparation').length }, fertilizer: { totalCost: fertilizerCost, totalBags: fertilizerRecords.reduce((sum, item) => sum + amount(item.details?.bags), 0), applications: fertilizerRecords.length }, spray: { totalCost: costsByType['Spray / Pesticide'], applications: sprayRecords.length }, pesticide: { totalCost: costsByType['Pesticide Application'], applications: pesticideRecords.length } } });
});

export const cropReports = asyncHandler(async (req, res) => {
  const seasons = (await collectionRefs.cropSeasons().where('userId', '==', req.user.uid).get()).docs.map(toDoc);
  const rows = await Promise.all(seasons.map(async season => { const activities = await listForSeason(collectionRefs.cropActivities, season.id, req.user.uid); const sales = await listForSeason(collectionRefs.cropSales, season.id, req.user.uid); const expenses = activities.reduce((sum, a) => sum + amount(a.totalCost), 0) + (season.landOwnership === 'Rented / Theka' ? amount(season.rentCost) : 0); const revenue = sales.reduce((sum, s) => sum + amount(s.netSaleAmount), 0); return { id: season.id, crop: season.cropName, field: season.fieldName, season: season.season, expenses, revenue, profit: revenue - expenses, status: season.status }; }));
  res.json({ rows });
});
