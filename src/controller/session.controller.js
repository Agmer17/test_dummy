import express from 'express';
import { requireAuth } from '../middleware/auth_middleware.js';
import * as sessionService from '../service/session.service.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const sessions = await sessionService.getSessions(req);
    res.json({ pesan: 'Berhasil mengambil daftar sesi', data: sessions });
  } catch (error) {
    res.status(500).json({ pesan: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { start_time, end_time, student_id, user_id, package_id, notes, status, zoom_link } = req.body;
    if (!start_time || !student_id || !user_id || !package_id) {
      return res.status(400).json({ pesan: 'start_time, student_id, user_id, dan package_id harus diisi' });
    }

    const data = { start_time, end_time, student_id, user_id, package_id, notes, status: status || 'scheduled', zoom_link };
    const newSession = await sessionService.createSession(data, req);
    res.status(201).json({ pesan: 'Berhasil membuat sesi', data: newSession });
  } catch (error) {
    if (error.message.includes('Forbidden')) return res.status(403).json({ pesan: error.message });
    res.status(500).json({ pesan: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedSession = await sessionService.updateSession(req.params.id, req.body, req);
    res.json({ pesan: 'Berhasil memperbarui sesi', data: updatedSession });
  } catch (error) {
    if (error.message.includes('Forbidden')) return res.status(403).json({ pesan: error.message });
    if (error.message.includes('not found')) return res.status(404).json({ pesan: error.message });
    res.status(500).json({ pesan: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await sessionService.deleteSession(req.params.id, req);
    res.json({ pesan: 'Berhasil menghapus sesi' });
  } catch (error) {
    if (error.message.includes('Forbidden')) return res.status(403).json({ pesan: error.message });
    if (error.message.includes('not found')) return res.status(404).json({ pesan: error.message });
    res.status(500).json({ pesan: error.message });
  }
});

export default router;
