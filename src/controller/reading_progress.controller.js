import express from 'express';
import * as readingProgressService from '../service/reading_progress.service.js';
import { requireAuth } from '../middleware/auth_middleware.js';

const router = express.Router();

// 1. GET DAILY STATUS
router.get('/status', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await readingProgressService.getDailyStatus(userId);
    res.status(200).json({
      pesan: "Berhasil mengambil status harian",
      data: status
    });
  } catch (error) {
    res.status(500).json({ pesan: "Gagal mengambil status", error: error.message });
  }
});

// 2. POST SUBMIT RESULT
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { drill_id, wpm, success } = req.body;
    
    if (!drill_id || wpm === undefined || success === undefined) {
      return res.status(400).json({ pesan: "Bad Request: Incomplete data" });
    }

    const result = await readingProgressService.submitDrillResult(userId, drill_id, wpm, success);
    res.status(201).json({
      pesan: "Berhasil menyimpan hasil test",
      data: result
    });
  } catch (error) {
    res.status(500).json({ pesan: "Gagal menyimpan hasil", error: error.message });
  }
});

export default router;
