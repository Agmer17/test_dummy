import express from 'express';
import * as readingService from '../service/reading.service.js';
import { requireAuth, requireAdmin } from '../middleware/auth_middleware.js';

const router = express.Router();

// --- CLIENT-FACING ENDPOINTS ---

// 1. GET DAILY DRILLS
router.get('/daily', requireAuth, async (req, res) => {
  try {
    const drills = await readingService.getDailyDrills();
    res.status(200).json({
      pesan: "Berhasil mengambil data daily drills",
      jumlah_data: drills.length,
      data: drills
    });
  } catch (error) {
    res.status(500).json({ pesan: "Gagal mengambil data", error: error.message });
  }
});


// --- ADMIN CRUD ENDPOINTS ---

// GET ALL
router.get('/', requireAdmin, async (req, res) => {
  try {
    const drills = await readingService.getAllDrills();
    res.status(200).json({
      pesan: "Berhasil mengambil master data reading drills",
      jumlah_data: drills.length,
      data: drills
    });
  } catch (error) {
    res.status(500).json({ pesan: "Gagal mengambil data", error: error.message });
  }
});

// GET BY ID
router.get('/id/:id', requireAdmin, async (req, res) => {
  try {
    const drill = await readingService.getDrillById(req.params.id);
    if (!drill) {
      return res.status(404).json({ pesan: "Data tidak ditemukan" });
    }
    res.status(200).json(drill);
  } catch (error) {
    res.status(500).json({ pesan: "Gagal mengambil data", error: error.message });
  }
});

// POST (Create)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const newDrill = await readingService.createDrill(req.body);
    res.status(201).json({
      message: "Berhasil menambahkan data reading drill baru!",
      data: newDrill
    });
  } catch (error) {
    res.status(400).json({ 
      message: "Gagal menambah data: " + error.message,
      data: null
    });
  }
});

// PUT (Update)
router.put('/update/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedDrill = await readingService.updateDrill(id, req.body);

    if (!updatedDrill) {
      return res.status(404).json({
        message: "Gagal mengubah data: ID tidak ditemukan",
        data: null
      });
    }

    res.status(200).json({
      message: "Berhasil mengubah data",
      data: updatedDrill
    });
  } catch (error) {
    res.status(400).json({ 
      message: "Gagal mengubah data: " + error.message,
      data: null
    });
  }
});

// DELETE
router.delete('/delete/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDrill = await readingService.deleteDrill(id);

    if (!deletedDrill) {
      return res.status(404).json({
        message: "Gagal menghapus data: ID tidak ditemukan",
        data: null
      });
    }

    res.status(200).json({
      message: "Berhasil menghapus data",
      data: deletedDrill
    });
  } catch (error) {
    res.status(400).json({ 
      message: "Gagal menghapus data: " + error.message,
      data: null
    });
  }
});

export default router;
