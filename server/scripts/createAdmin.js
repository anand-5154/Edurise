/*
  Usage:
    node scripts/createAdmin.js admin@example.com StrongPassword123!

  If no args provided, defaults to admin@example.com / Admin@123
*/

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/EduRise';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'instructor', 'admin'], default: 'admin' },
}, { timestamps: true });

async function run() {
  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'Admin@123';

  console.log('Connecting to', MONGO_URI);
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const Admin = mongoose.models.admin || mongoose.model('admin', adminSchema);

  const existing = await Admin.findOne({ email }).lean();
  if (existing) {
    console.log('Admin already exists with email:', email);
    const shouldUpdate = true; // change to prompt if you want interactive behavior
    if (shouldUpdate) {
      const hash = await bcrypt.hash(password, 10);
      await Admin.updateOne({ email }, { $set: { password: hash } });
      console.log('Updated existing admin password.');
    }
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);
  const created = await Admin.create({ email, password: hash, role: 'admin' });
  console.log('Created admin:', created.email);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
