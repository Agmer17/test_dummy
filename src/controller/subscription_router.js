import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth_middleware.js';
import { subscriptionService } from '../service/subscription_service.js';

const router = express.Router();

// Semua route wajib bawa token
router.use(requireAuth);

// ==========================================
// USER ROUTES (Berlaku RLS - Hanya akses miliknya)
// ==========================================

// GET /api/subscriptions -> Ambil semua langganan milik user
router.get('/', async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getSubscriptionsByUser(req.token);
    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/subscriptions/:id -> Ambil detail 1 langganan
router.get('/:id', async (req, res) => {
  try {
    // Abaikan route "admin" agar tidak bentrok
    if (req.params.id === 'admin') return next();

    const subscription = await subscriptionService.getSubscriptionById(req.token, req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription tidak ditemukan' });
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/subscriptions -> User buat langganan baru (Biasanya di-trigger setelah payment success)
router.post('/', async (req, res) => {
  try {
    const { student_id, package_id, sessions_total } = req.body;

    if (!student_id || !package_id || sessions_total === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'student_id, package_id, dan sessions_total wajib diisi!' 
      });
    }

    const payload = {
      user_id: req.user?.id,
      student_id,
      package_id,
      sessions_total,
      sessions_remaining: sessions_total, // Default awal sama dengan total
      status: 'active'
    };

    const newSubscription = await subscriptionService.createSubscription(req.token, payload);
    
    res.status(201).json({ success: true, message: 'Subscription berhasil dibuat', data: newSubscription });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==========================================
// ADMIN ROUTES (Bypass RLS)
// ==========================================

router.use(requireAdmin);

// GET /api/subscriptions/admin/all -> Admin lihat semua langganan di sistem
router.get('/admin/all', async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getAllSubscriptionsByAdmin();
    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/subscriptions/admin/:id -> Admin update kuota sesi atau status (misal: kurangi sisa sesi)
router.patch('/admin/update/:id', async (req, res) => {
  try {
    const { sessions_remaining, status } = req.body;
    
    const updatedSub = await subscriptionService.updateSubscriptionByAdmin(req.params.id, {
      sessions_remaining,
      status
    });

    res.status(200).json({ success: true, message: 'Subscription berhasil diupdate', data: updatedSub });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/subscriptions/admin/delete/:id -> Admin hapus data langganan
router.delete('/admin/delete/:id', async (req, res) => {
  try {
    const deletedSub = await subscriptionService.deleteSubscriptionByAdmin(req.params.id);
    
    if (!deletedSub) {
      return res.status(404).json({ success: false, error: 'Subscription tidak ditemukan' });
    }

    res.status(200).json({ success: true, message: 'Subscription berhasil dihapus', data: deletedSub });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;