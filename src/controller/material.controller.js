import express from 'express';
import { requireAuth } from '../middleware/auth_middleware.js';
import * as materialService from '../service/material.service.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { folderId } = req.query;
    const materials = await materialService.getMaterials(folderId, req.user.id);
    res.json({ pesan: 'Berhasil mengambil data material', data: materials });
  } catch (error) {
    res.status(500).json({ pesan: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { folderId, title, type, url } = req.body;
    if (!title || !type || !url) return res.status(400).json({ pesan: 'Title, type, dan url harus diisi' });

    const newMaterial = await materialService.createMaterial(folderId, title, type, url, req.user);
    res.status(201).json({ pesan: 'Berhasil membuat material', data: newMaterial });
  } catch (error) {
    if (error.message.includes('permission') || error.message.includes('admins')) {
      return res.status(403).json({ pesan: error.message });
    }
    res.status(500).json({ pesan: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, url, type } = req.body;
    if (!title && !url && !type) return res.status(400).json({ pesan: 'Minimal satu field harus diisi' });

    const updatedMaterial = await materialService.updateMaterial(req.params.id, title, url, type, req.user);
    res.json({ pesan: 'Berhasil memperbarui material', data: updatedMaterial });
  } catch (error) {
    if (error.message.includes('permission') || error.message.includes('admins')) {
      return res.status(403).json({ pesan: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ pesan: error.message });
    }
    res.status(500).json({ pesan: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await materialService.deleteMaterial(req.params.id, req.user);
    res.json({ pesan: 'Berhasil menghapus material' });
  } catch (error) {
    if (error.message.includes('permission') || error.message.includes('admins')) {
      return res.status(403).json({ pesan: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ pesan: error.message });
    }
    res.status(500).json({ pesan: error.message });
  }
});

export default router;
