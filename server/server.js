import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';

// Import routes
import tripsRoutes from './routes/trips.js';
import policiesRoutes from './routes/policies.js';
import expensesRoutes from './routes/expenses.js';
import advisoriesRoutes from './routes/advisories.js';
import destinationsRoutes from './routes/destinations.js';
import travelersRoutes from './routes/travelers.js';
import notificationsRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/trips', tripsRoutes);
app.use('/api/policies', policiesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/advisories', advisoriesRoutes);
app.use('/api/destinations', destinationsRoutes);
app.use('/api/travelers', travelersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});
