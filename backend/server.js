const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const noticeRoutes = require('./routes/noticeRoutes');
const authRoutes = require('./routes/authRoutes');
const { DEPARTMENTS, CATEGORIES } = require('./config/collegeConfig');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads folder for notice attachments
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Config endpoint for dynamic frontend metadata
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    data: {
      collegeName: 'Prasad V. Potluri Siddhartha Institute of Technology',
      shortName: 'PVPSIT College',
      departments: DEPARTMENTS,
      categories: CATEGORIES,
    },
  });
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PVPSIT Digital Notice Board API is running',
    version: '2.0.0',
    endpoints: {
      notices: '/api/notices',
      auth: '/api/auth',
      config: '/api/config',
    },
  });
});

// API Routes
app.use('/api/notices', noticeRoutes);
app.use('/api/auth', authRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 PVPSIT Notice Server running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=========================================`);
  });
}

process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Error: ${err.message}`);
});

module.exports = app;
