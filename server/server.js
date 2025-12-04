import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import routes
import pollRoutes from './routes/pollRoutes.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { sanitizeData, preventParameterPollution, sanitizeXSS, setSecurityHeaders } from './middlewares/sanitizer.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Security headers
app.use(setSecurityHeaders);

// Data sanitization against NoSQL injection
app.use(sanitizeData);

// Prevent parameter pollution
app.use(preventParameterPollution);

// XSS protection
app.use(sanitizeXSS);

// Rate limiting for all API routes
app.use('/api', apiLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Campus Poll API',
    version: '1.0.0',
    status: 'running',
  });
});

// API routes
app.use('/api', pollRoutes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handler - must be last
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});