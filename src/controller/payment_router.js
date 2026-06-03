import express from 'express';
import { requireAuth, requireAdmin } from './../middleware/auth_middleware.js';
import { paymentService } from './../service/payment_service.js';

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (Gak butuh auth middleware)
// ==========================================

// POST /api/payments/webhook -> Callback otomatis dari Pakasir
router.post('/webhook', async (req, res) => {
  try {
    console.log('Pakasir Webhook Event Received:', req.body);
    await paymentService.handleIncomingWebhook(req.body);
    
    res.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing failed:', error.message);
    // Tetap kirim status 400/500 agar pihak Pakasir tahu kirimannya gagal diproses sistem kamu
    res.status(400).json({ success: false, error: error.message });
  }
});


// ==========================================
// USER ROUTES (Wajib bawa Token User + Mematuhi RLS)
// ==========================================
router.use(requireAuth);

// POST /api/payments/create-qris -> Generate QRIS baru
router.post('/create-qris', async (req, res) => {
  try {
    if (!req.body.package_id || !req.body.amount) {
      return res.status(400).json({ success: false, error: 'package_id dan amount wajib dilampirkan' });
    }
    
    const payment = await paymentService.createQrisPayment(req.token, req.user.id, req.body);
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/payments/my-payments -> Get list payment milik user login sendiri
router.get('/my-payments', async (req, res) => {
  try {
    const payments = await paymentService.getMyPayments(req.token, req.user.id);
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/payments/cancel/:id -> Batalkan transaksi pending milik sendiri
router.post('/cancel/:id', async (req, res) => {
  try {
    const cancelledPayment = await paymentService.cancelMyPayment(req.token, req.user.id, req.params.id);
    res.json({ success: true, message: 'Transaksi berhasil dibatalkan', data: cancelledPayment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});


// ==========================================
// ADMIN ROUTES (Menggunakan Admin Client / Bypassing RLS)
// ==========================================
router.use(requireAdmin);

// GET /api/payments/all -> Admin monitoring seluruh payment di sistem
router.get('/all', async (req, res) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/payments/id/:id -> Admin melihat detail record payment spesifik
router.get('/id/:id', async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(404).json({ success: false, error: 'Data payment tidak ditemukan' });
  }
});

export default router;