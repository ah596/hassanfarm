import { z } from 'zod';

export const animalSchema = z.object({
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
  image: z.string().optional().nullable()
});

export const breedingSchema = z.object({
  breedingDate: z.string().min(1),
  notes: z.string().optional().nullable()
});

export const birthSchema = z.object({
  actualBirthDate: z.string().min(1),
  notes: z.string().optional().nullable()
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
