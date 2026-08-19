import { z } from 'zod';

export const animalSchema = z.object({
  animalId: z.string().trim().min(1).max(80).optional(),
  name: z.string().optional().nullable(),
  type: z.enum(['Cow', 'Goat', 'Sheep']),
  gender: z.enum(['Male', 'Female']),
  breed: z.string().min(1),
  color: z.string().optional().nullable(),
  weight: z.coerce.number().min(0),
  dob: z.string().optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  purchasePrice: z.coerce.number().min(0).optional().nullable(),
  sellerName: z.string().optional().nullable(),
  sellerContact: z.string().optional().nullable(),
  status: z.enum(['Available', 'Sold', 'Dead', 'Transferred']).default('Available'),
  notes: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  isSelfBreed: z.boolean().optional().default(false)
});

export const breedingSchema = z.object({
  breedingDate: z.string().min(1),
  pregnancyNumber: z.coerce.number().int().min(1).max(30).default(1),
  notes: z.string().optional().nullable()
});

export const birthSchema = z.object({
  actualBirthDate: z.string().min(1),
  notes: z.string().optional().nullable()
});

export const pregnancyOutcomeSchema = z.object({
  outcome: z.enum(['Birth', 'Abortion', 'Stillbirth']),
  outcomeDate: z.string().min(1),
  babyName: z.string().trim().max(80).optional().nullable(),
  babyGender: z.enum(['Male', 'Female']).optional(),
  notes: z.string().optional().nullable()
}).superRefine((value, ctx) => {
  if (value.outcome === 'Birth' && !value.babyGender) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['babyGender'], message: 'Select the baby gender' });
  }
});

export const expenseSchema = z.object({
  animalId: z.string().optional().nullable(),
  category: z.enum(['Feed', 'Medicine', 'Veterinary', 'Vaccination', 'Transportation', 'Labor', 'Other']),
  amount: z.coerce.number().min(0),
  date: z.string().min(1),
  description: z.string().optional().nullable(),
  receipt: z.string().optional().nullable()
});

export const feedSchema = z.object({
  animalId: z.string().optional().nullable(),
  feedType: z.string().min(1),
  quantity: z.coerce.number().min(0),
  unit: z.string().min(1),
  pricePerUnit: z.coerce.number().min(0),
  date: z.string().min(1),
  notes: z.string().optional().nullable()
});

export const medicineSchema = z.object({
  animalId: z.string().optional().nullable(),
  medicineName: z.string().min(1),
  medicineType: z.string().min(1),
  quantity: z.coerce.number().min(0),
  cost: z.coerce.number().min(0),
  date: z.string().min(1),
  veterinaryDoctor: z.string().optional().nullable(),
  description: z.string().optional().nullable()
});

export const saleSchema = z.object({
  animalId: z.string().min(1),
  saleDate: z.string().min(1),
  salePrice: z.coerce.number().min(0),
  buyerName: z.string().min(1),
  buyerContact: z.string().optional().nullable(),
  saleWeight: z.coerce.number().min(0).optional().nullable(),
  pricePerKg: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable()
});

export const cropSeasonSchema = z.object({
  cropName: z.string().trim().min(1).max(80),
  variety: z.string().trim().optional().nullable(),
  season: z.string().trim().min(1).max(50),
  fieldName: z.string().trim().max(100).optional().nullable(),
  totalArea: z.coerce.number().positive(),
  areaUnit: z.enum(['Acre', 'Kanal', 'Marla']),
  sowingDate: z.string().optional().nullable(),
  expectedHarvestDate: z.string().optional().nullable(),
  landOwnership: z.enum(['Own', 'Rented / Theka']).default('Own'),
  rentCost: z.coerce.number().min(0).optional().default(0),
  notes: z.string().optional().nullable(),
  status: z.enum(['Planned', 'Active', 'Harvested', 'Sold', 'Closed']).default('Planned')
});

export const cropActivitySchema = z.object({
  type: z.enum(['Land Preparation', 'Seed / Sowing', 'Fertilizer', 'Spray / Pesticide', 'Pesticide Application', 'Irrigation', 'Labour', 'Machinery', 'Other Expense', 'Harvesting']),
  date: z.string().optional().nullable(),
  title: z.string().trim().max(120).optional().default(''),
  quantity: z.coerce.number().min(0).optional().default(0),
  unit: z.string().trim().max(30).optional().nullable(),
  totalCost: z.coerce.number().min(0).optional().default(0),
  details: z.record(z.any()).optional().default({}),
  notes: z.string().optional().nullable()
});

export const cropYieldSchema = z.object({
  date: z.string().min(1),
  harvestNumber: z.string().trim().min(1).max(80),
  totalProduction: z.coerce.number().min(0),
  unit: z.enum(['Kg', 'Maund', 'Ton', 'Bags']),
  bags: z.coerce.number().min(0).optional().default(0),
  weightPerBag: z.coerce.number().min(0).optional().default(0),
  quality: z.string().optional().nullable(),
  moisture: z.string().optional().nullable(),
  storedQuantity: z.coerce.number().min(0).optional().default(0),
  soldQuantity: z.coerce.number().min(0).optional().default(0),
  notes: z.string().optional().nullable()
});

export const cropSaleSchema = z.object({
  saleDate: z.string().min(1),
  buyerName: z.string().trim().min(1),
  quantitySold: z.coerce.number().min(0),
  unit: z.enum(['Kg', 'Maund', 'Ton', 'Bags']),
  ratePerUnit: z.coerce.number().min(0),
  transportCost: z.coerce.number().min(0).optional().default(0),
  marketCharges: z.coerce.number().min(0).optional().default(0),
  commission: z.coerce.number().min(0).optional().default(0),
  otherDeduction: z.coerce.number().min(0).optional().default(0),
  paymentStatus: z.enum(['Paid', 'Partial', 'Pending']).default('Pending'),
  amountReceived: z.coerce.number().min(0).optional().default(0),
  notes: z.string().optional().nullable()
});
