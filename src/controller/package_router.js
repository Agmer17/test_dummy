import express from 'express';
import { requireAuth, requireAdmin } from './../middleware/auth_middleware.js';
import { packageService } from './../service/package_service.js';

const router = express.Router();

// Semua route di file ini wajib login/bawa token
router.use(requireAuth);
router.use(requireAdmin)



// ==========================================
// ADMIN ROUTES (Bypass RLS + Include .profiles)
// ==========================================
// GET /api/packages/all -> Admin melihat semua paket sistem + data owner-nya
router.get('/all', async (req, res) => {
  try {
    const packages = await packageService.getAllPackages();
    res.json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/packages/id/:id -> Admin melihat detail satu paket
router.get('/id/:id', async (req, res) => {
  try {
    const pkg = await packageService.getPackageById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, error: 'Paket tidak ditemukan' });
    res.json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/packages/admin/create -> Admin membuat paket bebas beralias user lain
router.post('/', async (req, res) => {
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

// PATCH /api/packages/admin/update/:id -> Admin mengubah paket siapapun secara paksa
router.patch('/update/:id', async (req, res) => {
  try {
    const updated = await packageService.updatePackageByAdmin(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/packages/admin/delete/:id -> Admin menghapus paket siapapun secara paksa
router.delete('/delete/:id', async (req, res) => {
  try {
    await packageService.deletePackageByAdmin(req.params.id);
    res.json({ success: true, message: 'Paket berhasil dihapus oleh admin' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;