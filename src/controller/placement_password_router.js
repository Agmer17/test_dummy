import express from 'express';
import bcrypt from 'bcrypt';
import { requireAuth, requireAdmin } from '../middleware/auth_middleware.js';
import { placementPasswordService } from '../service/placement_password_service.js';

const router = express.Router();

// Semua route di sini wajib bawa token DAN harus role super_admin 
// (karena RLS placement_passwords mensyaratkan admin)
router.use(requireAuth);
router.use(requireAdmin);

// ==========================================
// ADMIN ROUTES (Read, Create, Delete)
// ==========================================

// GET /api/placement-passwords -> Ambil semua password (Bisa buat list di dashboard admin)
router.get('/', async (req, res) => {
  try {
    const passwords = await placementPasswordService.getPasswords();
    res.status(200).json({ success: true, data: passwords });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/placement-passwords -> Bikin password baru
router.post('/', async (req, res) => {
  try {
    const { password, expires_at } = req.body;

    // 1. Validasi field wajib
    if (!password || !expires_at) {
      return res.status(400).json({ 
        success: false, 
        error: 'password dan expires_at wajib diisi!' 
      });
    }

    // 2. Hash password sesuai kebutuhan di skema database
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Ambil ID admin yang membuat password (asumsi req.user di-set oleh auth_middleware)
    const created_by = req.user?.id;

    // Siapkan payload
    const payload = {
      password, // Plain text disave sesuai skema (hati-hati, pastikan ini memang sesuai kebutuhan design-mu)
      password_hash,
      expires_at,
      created_by
    };

    const newPassword = await placementPasswordService.createPassword(req.token, payload);
    res.status(201).json({ success: true, message: 'Placement password berhasil ditambahkan', data: newPassword });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/placement-passwords/delete/:id -> Hapus password
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedPassword = await placementPasswordService.deletePassword(req.params.id);
    
    if (!deletedPassword) {
      return res.status(404).json({ success: false, error: 'Password tidak ditemukan' });
    }

    res.status(200).json({ success: true, message: 'Password berhasil dihapus', data: deletedPassword });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;