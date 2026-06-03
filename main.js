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

app.get('/get-all/curriculum-lessons', async (req, res) => {
    try {
        
    const lesson = await CurriculumLesson.find();
        if (!lesson) {
      return res.status(404).json({ pesan: "Data tidak ditemukan" });
    }
    
    res.status(200).json(lesson);
    } catch (error) {
         res.status(500).json({ pesan: "Gagal mengambil data", error: error.message });
    }
})

// POST: Menambah data curriculum lesson baru
app.post('/curriculum-lessons', async (req, res) => {
  try {
    // req.body berisi data JSON panjang yang kamu kirimkan
    const newLesson = await CurriculumLesson.create(req.body);
    
    res.status(201).json({
      message: " Berhasil menambahkan data lesson baru!",
      data: newLesson
    });
  } catch (error) {
    res.status(400).json({ 
      message: " Gagal menambah data " + error.message,
      data : null
    });
  }
});

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

  // ==========================================
// UPDATE & DELETE DATA CURRICULUM LESSON
// ==========================================

// UPDATE: Mengubah data berdasarkan ID (PUT)
app.put('/curriculum-lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cari data berdasarkan ID, lalu update dengan req.body
    // { new: true } berfungsi untuk mengembalikan data SETELAH diupdate
    const updatedLesson = await CurriculumLesson.findByIdAndUpdate(id, req.body, { new: true });

    // Jika ID tidak ditemukan di database
    if (!updatedLesson) {
      return res.status(404).json({
        message: " Gagal mengubah data: ID tidak ditemukan",
        data: null
      });
    }

    res.status(200).json({
      message: " Berhasil mengubah data ",
      data: updatedLesson
    });

  } catch (error) {
    res.status(400).json({ 
      message: " Gagal mengubah data " + error.message,
      data: null
    });
  }
});


// DELETE: Menghapus data berdasarkan ID (DELETE)
app.delete('/curriculum-lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Cari dan hapus data berdasarkan ID
    const deletedLesson = await CurriculumLesson.findByIdAndDelete(id);

    // Jika ID tidak ditemukan di database
    if (!deletedLesson) {
      return res.status(404).json({
        message: " Gagal menghapus data: ID tidak ditemukan",
        data: null
      });
    }

    res.status(200).json({
      message: " Berhasil menghapus data ",
      data: deletedLesson
    });

  } catch (error) {
    res.status(400).json({ 
      message: " Gagal menghapus data " + error.message,
      data: null
    });
  }
});