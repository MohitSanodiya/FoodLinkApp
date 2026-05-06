const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Database Connection
connectDB().then(async () => {
  try {
    const adminEmail = 'admin@foodlink.com';
    const adminExists = await User.findOne({ where: { email: adminEmail } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Platform Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        isVerified: true
      });
      console.log('✅ Admin user seeded automatically on startup!');
    }
  } catch (err) {
    console.error('Failed to auto-seed admin:', err.message);
  }
});

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Node.js Admin Backend is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Admin Backend running on http://localhost:${PORT}`);
});
