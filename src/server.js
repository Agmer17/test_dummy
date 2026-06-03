import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  // Hubungkan ke database
  await connectDB();
  
  // Jalankan server Express
  app.listen(PORT, () => {
    console.log(`Server jalan di http://localhost:${PORT}`);
  });
};

startServer();
