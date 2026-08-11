import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import animalRoutes from './routes/animalRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import feedRoutes from './routes/feedRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { errorHandler, notFound } from './middleware/error.js';
import { initFirebaseAdmin } from './config/firebase.js';

dotenv.config();
initFirebaseAdmin();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'goat-farm-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
