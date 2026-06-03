import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth_middleware.js';
import { reviewService } from '../service/review_service.js';

const router = express.Router();

// Semua route di sini wajib bawa token
router.use(requireAuth);

// ==========================================
// USER ROUTES (Read & Create)
// ==========================================

// GET /api/reviews -> Ambil semua review (Bisa query /api/reviews?tutor_id=123)
router.get('/', async (req, res) => {
  try {
    const { tutor_id } = req.query;
    const reviews = await reviewService.getReviews(tutor_id);
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/reviews -> Bikin review baru
router.post('/', async (req, res) => {
  try {
    const { tutor_id, student_name, rating } = req.body;

    // 1. Validasi field wajib
    if (!tutor_id || !student_name || !rating) {
      return res.status(400).json({ 
        success: false, 
        error: 'tutor_id, student_name, dan rating wajib diisi!' 
      });
    }

    // 2. Validasi constraint database: rating 1-7
    if (rating < 1 || rating > 7) {
      return res.status(400).json({ 
        success: false, 
        error: 'Rating harus berada di antara 1 sampai 7' 
      });
    }

    const newReview = await reviewService.createReview(req.token, req.body);
    res.status(201).json({ success: true, message: 'Review berhasil ditambahkan', data: newReview });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==========================================
// ADMIN ROUTES (Delete)
// ==========================================

// Pasang guard super_admin buat route di bawah ini
router.use(requireAdmin);

// DELETE /api/reviews/:id -> Hapus review (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const deletedReview = await reviewService.deleteReviewByAdmin(req.params.id);
    
    if (!deletedReview) {
      return res.status(404).json({ success: false, error: 'Review tidak ditemukan' });
    }

    res.status(200).json({ success: true, message: 'Review berhasil dihapus', data: deletedReview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;