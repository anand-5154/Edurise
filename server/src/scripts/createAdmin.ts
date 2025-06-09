import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/implementations/userModel';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edurise');

        const adminExists = await User.findOne({ email: 'admin@edurise.com', role: 'admin' });
        if (adminExists) {
            console.log('Admin user already exists');
            return;
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({
            name: 'Admin User',
            email: 'admin@edurise.com',
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.disconnect();
    }
};

createAdmin(); 