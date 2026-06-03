import express from 'express';
import { requireAuth } from '../middleware/auth_middleware.js';
import * as folderService from '../service/folder.service.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { parentId } = req.query;
    const folders = await folderService.getFolders(parentId, req.user.id);
    res.json({ pesan: 'Berhasil mengambil data folder', data: folders });
  } catch (error) {
    res.status(500).json({ pesan: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    if (!name) return res.status(400).json({ pesan: 'Nama folder harus diisi' });

    const newFolder = await folderService.createFolder(name, parentId, req.user);
    res.status(201).json({ pesan: 'Berhasil membuat folder', data: newFolder });
  } catch (error) {
    res.status(500).json({ pesan: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ pesan: 'Nama folder harus diisi' });

    const updatedFolder = await folderService.updateFolder(req.params.id, name, req.user);
    res.json({ pesan: 'Berhasil memperbarui folder', data: updatedFolder });
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
    await folderService.deleteFolder(req.params.id, req.user);
    res.json({ pesan: 'Berhasil menghapus folder' });
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
