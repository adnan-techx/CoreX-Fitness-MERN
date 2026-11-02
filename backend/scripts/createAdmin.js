require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = (process.env.ADMIN_EMAIL || 'admin@corexfitness.com').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const name = process.env.ADMIN_NAME || 'CoreX Admin';
    let admin = await User.findOne({ email }).select('+password');
    if (admin) {
      admin.role = 'admin'; admin.isActive = true;
      if (process.env.ADMIN_PASSWORD) admin.password = password;
      await admin.save();
      console.log(`Admin account updated: ${email}`);
    } else {
      admin = await User.create({ name, email, password, role: 'admin' });
      console.log(`Admin account created: ${email}`);
    }
    console.log('Set a strong ADMIN_PASSWORD in backend/.env before using this on a real server.');
  } catch (error) {
    console.error('Could not create admin:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
main();
