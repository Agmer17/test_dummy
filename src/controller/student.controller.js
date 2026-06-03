import express from 'express';
import { requireAuth } from '../middleware/auth_middleware.js';
import * as studentService from '../service/student.service.js';

const router = express.Router();

// Semua akses membutuhkan autentikasi
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const students = await studentService.getStudents(req);
    res.json({ pesan: 'Berhasil mengambil daftar siswa', data: students });
  } catch (error) {
    res.status(500).json({ pesan: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const student = await studentService.getStudentById(req.params.id, req);
    res.json({ pesan: 'Berhasil mengambil detail siswa', data: student });
  } catch (error) {
    if (error.message.includes('Forbidden')) return res.status(403).json({ pesan: error.message });
    if (error.message.includes('not found')) return res.status(404).json({ pesan: error.message });
    res.status(500).json({ pesan: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { full_name, nickname, zoom_link, phone, job, age, schedule_preference, teacher_id, authData, packageId } = req.body;
    
    if (!full_name) return res.status(400).json({ pesan: 'Parameter full_name wajib diisi' });

    const studentData = { full_name, nickname, zoom_link, phone, job, age, schedule_preference, teacher_id };
    
    const newStudent = await studentService.createStudent(studentData, authData, packageId, req);
    res.status(201).json({ pesan: 'Berhasil membuat siswa baru', data: newStudent });
  } catch (error) {
    if (error.message.includes('Forbidden')) return res.status(403).json({ pesan: error.message });
    res.status(500).json({ pesan: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedStudent = await studentService.updateStudent(req.params.id, req.body, req);
    res.json({ pesan: 'Berhasil memperbarui data siswa', data: updatedStudent });
  } catch (error) {
    if (error.message.includes('Forbidden')) return res.status(403).json({ pesan: error.message });
    if (error.message.includes('not found')) return res.status(404).json({ pesan: error.message });
    res.status(500).json({ pesan: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await studentService.deleteStudent(req.params.id, req);
    res.json({ pesan: 'Berhasil menghapus siswa' });
  } catch (error) {
    if (error.message.includes('Forbidden')) return res.status(403).json({ pesan: error.message });
    if (error.message.includes('not found')) return res.status(404).json({ pesan: error.message });
    res.status(500).json({ pesan: error.message });
  }
});

export default router;
