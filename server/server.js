import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// API routes
app.use('/api', pollRoutes);

// Serve React app for all other routes (React Router handling)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

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