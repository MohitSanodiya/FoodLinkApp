const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { connectDB, sequelize } = require('../config/db');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@foodlink.com';
    const adminExists = await User.findOne({ where: { email: adminEmail } });

    if (adminExists) {
      console.log('⚠️ Admin user already exists. Skipping...');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await User.create({
      name: 'Platform Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      isVerified: true
    });

    console.log('✅ Admin user seeded successfully! Email: admin@foodlink.com / Pass: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
