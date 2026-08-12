import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Prisma } from '@prisma/client';
import { AppError } from './utils/app-error';
import authRouter from './routes/auth.routes';
import customerRouter from './routes/customer.routes';
import productRouter from './routes/product.routes';
import inventoryRouter from './routes/inventory.routes';
import stockRouter from './routes/stock.routes';
import challanRouter from './routes/challan.routes';

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'ERP/CRM Backend API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Base API route
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to the ERP/CRM API',
    version: '1.0.0',
  });
});

// Auth API routes
app.use('/api/auth', authRouter);

// Customer CRM routes
app.use('/api/customers', customerRouter);

// Products & Catalog routes
app.use('/api/products', productRouter);

// Inventory & Stock routes
app.use('/api/inventory', inventoryRouter);
app.use('/api/stock', stockRouter);
app.use('/api/challans', challanRouter);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const statusCode = err.code === 'P2002' ? 409 : err.code === 'P2025' ? 404 : 400;
    const message = err.code === 'P2002' ? 'A record with this value already exists' : err.code === 'P2025' ? 'Requested record was not found' : 'Database request failed';
    res.status(statusCode).json({ success: false, message });
    return;
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : 'Unexpected server error',
  });
});

export default app;
