require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const { testConnection } = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const adminRoutes = require('./routes/adminRoutes');
const articleRoutes = require('./routes/articleRoutes');
const quizRoutes = require('./routes/quizRoutes');

const app = express();
app.set('trust proxy', 1);

// ---------------------------------------------------------------------
// Security & core middleware
// ---------------------------------------------------------------------
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', apiLimiter);

// Serve uploaded screenshots (read-only static access)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CyberShield API is running.', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api', analysisRoutes); // /api/analyze/*, /api/analyses, /api/dashboard-stats
app.use('/api/admin', adminRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/quiz', quizRoutes);

// ---------------------------------------------------------------------
// 404 + centralized error handling
// ---------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`\n🛡️  CyberShield API listening on http://localhost:${PORT}`);
  await testConnection();
});

module.exports = app;
