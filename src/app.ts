import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import './config/passport';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import restaurantRoutes from './routes/restaurant.routes';
import contactRoutes from './routes/contact.routes';
import { errorHandler, notFound } from './middlewares/errorHandler';

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

const allowedOrigins = env.FRONTEND_URLS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedVercelFrontend = (origin: string): boolean =>
  /^https:\/\/como-en-casa-frontend(?:-[a-z0-9-]+)?\.vercel\.app$/.test(origin);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || isAllowedVercelFrontend(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origen no permitido por CORS.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: '🔥 La API de ComoEnCasa está funcionando',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/contact', contactRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
