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
import cropRoutes from './routes/cropRoutes.js';
import dairyRoutes from './routes/dairyRoutes.js';
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

// Vercel Services removes the /api route prefix before forwarding requests.
// Keeping both paths also preserves the local API URL (http://localhost:5000/api).
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/animals', '/animals'], animalRoutes);
app.use(['/api/expenses', '/expenses'], expenseRoutes);
app.use(['/api/feed', '/feed'], feedRoutes);
app.use(['/api/medicine', '/medicine'], medicineRoutes);
app.use(['/api/sales', '/sales'], saleRoutes);
app.use(['/api/dashboard', '/dashboard'], dashboardRoutes);
app.use(['/api/reports', '/reports'], reportRoutes);
app.use(['/api/crops', '/crops'], cropRoutes);
app.use(['/api/dairy', '/dairy'], dairyRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
