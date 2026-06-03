import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGO_DB });
    console.log('Terhubung ke database omongin');
  } catch (error) {
    console.error('Gagal konek database:', error.message);
    process.exit(1);
  }
};
