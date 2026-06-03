import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import CurriculumLesson from './models/CurriculumLesson.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 1. GET ALL: Mengambil semua data dari curriculum_lessons
app.get('/curriculum-lessons', async (req, res) => {
  try {
    const lessons = await CurriculumLesson.find();
    res.status(200).json({
      pesan: "Berhasil mengambil data kurikulum",
      jumlah_data: lessons.length,
      data: lessons
    });
  } catch (error) {
    res.status(500).json({ pesan: "Gagal mengambil data", error: error.message });
  }
});

// 2. GET BY ID: Mengambil satu data kurikulum berdasarkan ID
app.get('/curriculum-lessons/:id', async (req, res) => {
  try {
    const lesson = await CurriculumLesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ pesan: "Data tidak ditemukan" });
    }
    
    res.status(200).json(lesson);
  } catch (error) {
    res.status(500).json({ pesan: "Gagal mengambil data", error: error.message });
  }
});

app.get('')

// Koneksi Database dan Jalankan Server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Terhubung ke database omongin');
    app.listen(PORT, () => {
      console.log(`Server jalan di http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Gagal konek database:', error.message);
  });