import express from 'express';
import { requireAuth, requireAdmin } from './../middleware/auth_middleware.js';
import { userService } from './../service/user_service.js';

const router = express.Router();

// Semua route di sini wajib bawa token
router.use(requireAuth);

// ==========================================
// USER ROUTES
// ==========================================

// GET /api/users/my-profiles -> Ambil profil sendiri
router.get('/my-profiles', async (req, res) => {
  try {
    // req.user dan req.token ini didapet dari middleware requireAuth
    const profile = await userService.getMyProfile(req.token, req.user.id);
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PATCH /api/users/my-profiles -> Update profil sendiri (Nama/Avatar)
router.patch('/my-profiles', async (req, res) => {
  try {
    // Validasi constraint database: username_length >= 3
    if (req.body.full_name && req.body.full_name.length < 3) {
      return res.status(400).json({ success: false, error: 'Nama lengkap minimal 3 karakter' });
    }

    const updatedProfile = await userService.updateMyProfile(req.token, req.user.id, req.body);
    res.json({ success: true, data: updatedProfile });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==========================================
// ADMIN ROUTES (CRUD Lengkap)
// ==========================================

// Pasang guard super_admin buat semua route di bawah ini
router.use(requireAdmin);

// GET /api/users -> Ambil semua profil
router.get('/all', async (req, res) => {
  console.log(req.path)
  try {
    const profiles = await userService.getAllProfiles();
    res.json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/users/:id -> Ambil profil spesifik
router.get('/:id', async (req, res) => {
  try {
    const profile = await userService.getProfileById(req.params.id);
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(404).json({ success: false, error: 'User tidak ditemukan' });
  }
});

// PATCH /api/users/:id -> Admin bebas ubah data termasuk role
router.patch('/:id', async (req, res) => {
  try {
    const updatedProfile = await userService.updateProfileByAdmin(req.params.id, req.body);
    res.json({ success: true, data: updatedProfile });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/users/:id -> Hapus user dari sistem sepenuhnya
router.delete('/:id', async (req, res) => {
  try {
    await userService.deleteUserFull(req.params.id);
    res.json({ success: true, message: 'User beserta profilnya berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;