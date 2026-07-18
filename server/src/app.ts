import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { morganMiddleware } from './middlewares/logger.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { NotFoundError } from './utils/errors';
import { setupSwagger } from './config/swagger';

// Route Imports
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import recurringTaskRoutes from './routes/recurring-task.routes';
import timerRoutes from './routes/timer.routes';
import dashboardRoutes from './routes/dashboard.routes';
import analyticsRoutes from './routes/analytics.routes';
import statisticsRoutes from './routes/statistics.routes';
import calendarRoutes from './routes/calendar.routes';
import reportsRoutes from './routes/reports.routes';

const app = express();

// Required for Render (and any reverse-proxy deployment):
// Without this, req.ip is the proxy's internal IP (not the client's real IP),
// req.secure is always false, and express-rate-limit throttles all users as one.
app.set('trust proxy', 1);

// 1. Security Headers (Helmet)
app.use(helmet());

// 2. CORS configurations with credentials/cookies support
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];
const allowedOrigins: string[] = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : defaultOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Enables reading HTTP-Only cookie credentials
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 3. Rate limiting protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 200, // Limit each IP to 200 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// 4. Morgan HTTP Request logger
app.use(morganMiddleware);

// 5. Body and Cookie Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 6. Swagger API Documentation Page
setupSwagger(app);

// 7. Core Application Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/recurring-tasks', recurringTaskRoutes);
app.use('/api/timer', timerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/reports', reportsRoutes);

// 8. Catch-all for undefined route paths
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Endpoint not found: ${req.method} ${req.originalUrl}`));
});

// 9. Centralized Error Handler Middleware
app.use(errorHandler);

export default app;
