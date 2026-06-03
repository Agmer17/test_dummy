import express from 'express';
import { requireAuth, requireAdmin } from './../middleware/auth_middleware.js';
import { packageService } from './../service/package_service.js';

const router = express.Router();

// Semua operasi package wajib login terlebih dahulu
router.use(requireAuth);

// ==========================================
// USER ROUTES (Sesuai RLS masing-masing)
// ==========================================

// GET /api/packages/my-packages -> List paket milik user sendiri
router.get('/my-packages', async (req, res) => {
  try {
    const packages = await packageService.getMyPackages(req.token);
    res.json({ success: true, data: packages });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/packages -> Membuat paket baru milik sendiri
router.post('/', async (req, res) => {
  try {
    if (!req.body.name || !req.body.total_sessions) {
      return res.status(400).json({ success: false, error: 'Nama paket dan total_sessions wajib diisi' });
    }
    const newPackage = await packageService.createMyPackage(req.token, req.user.id, req.body);
    res.status(201).json({ success: true, data: newPackage });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PATCH /api/packages/:id -> Mengubah paket milik sendiri
router.patch('/:id', async (req, res) => {
  try {
    const updatedPackage = await packageService.updateMyPackage(req.token, req.params.id, req.body);
    res.json({ success: true, data: updatedPackage });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/packages/:id -> Menghapus paket milik sendiri
router.delete('/:id', async (req, res) => {
  try {
    await packageService.deleteMyPackage(req.token, req.params.id);
    res.json({ success: true, message: 'Paket berhasil dihapus' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});


// ==========================================
// ADMIN ROUTES (CRUD Total Bypassing RLS)
// ==========================================
router.use(requireAdmin);

// GET /api/packages/all -> Admin melihat seluruh paket di sistem (plus data pembuatnya)
router.get('/all', async (req, res) => {
  try {
    const packages = await packageService.getAllPackages();
    res.json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/packages/id/:id -> Detail paket spesifik untuk admin
router.get('/id/:id', async (req, res) => {
  try {
    const pkg = await packageService.getPackageById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, error: 'Paket tidak ditemukan' });
    res.json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/packages/admin/create -> Admin membuat paket (bisa di-assign ke user_id tertentu)
router.post('/admin/create', async (req, res) => {
  try {
    if (!req.body.name || !req.body.total_sessions) {
      return res.status(400).json({ success: false, error: 'Nama paket dan total_sessions wajib diisi' });
    }
    const adminPackage = await packageService.createPackageByAdmin(req.body);
    res.status(201).json({ success: true, data: adminPackage });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PATCH /api/packages/admin/update/:id -> Admin bebas update paket milik siapapun
router.patch('/admin/update/:id', async (req, res) => {
  try {
    const updated = await packageService.updatePackageByAdmin(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/packages/admin/delete/:id -> Admin menghapus paket milik siapapun secara paksa
router.delete('/admin/delete/:id', async (req, res) => {
  try {
    await packageService.deletePackageByAdmin(req.params.id);
    res.json({ success: true, message: 'Paket berhasil dihapus oleh admin' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;