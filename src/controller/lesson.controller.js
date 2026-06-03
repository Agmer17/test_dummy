import * as lessonService from '../service/lesson.service.js';

export const getAllLessons = async (req, res) => {
  try {
    const lessons = await lessonService.getAllLessons();
    res.status(200).json({
      pesan: "Berhasil mengambil data kurikulum",
      jumlah_data: lessons.length,
      data: lessons
    });
  } catch (error) {
    res.status(500).json({ pesan: "Gagal mengambil data", error: error.message });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ pesan: "Data tidak ditemukan" });
    }
    
    res.status(200).json(lesson);
  } catch (error) {
    res.status(500).json({ pesan: "Gagal mengambil data", error: error.message });
  }
};

export const getAllLessonsLegacy = async (req, res) => {
  try {
    const lesson = await lessonService.getAllLessons();
    if (!lesson) {
      return res.status(404).json({ pesan: "Data tidak ditemukan" });
    }
    
    res.status(200).json(lesson);
  } catch (error) {
    res.status(500).json({ pesan: "Gagal mengambil data", error: error.message });
  }
};

export const createLesson = async (req, res) => {
  try {
    const newLesson = await lessonService.createLesson(req.body);
    
    res.status(201).json({
      message: " Berhasil menambahkan data lesson baru!",
      data: newLesson
    });
  } catch (error) {
    res.status(400).json({ 
      message: " Gagal menambah data " + error.message,
      data: null
    });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedLesson = await lessonService.updateLesson(id, req.body);

    if (!updatedLesson) {
      return res.status(404).json({
        message: " Gagal mengubah data: ID tidak ditemukan",
        data: null
      });
    }

    res.status(200).json({
      message: " Berhasil mengubah data ",
      data: updatedLesson
    });

  } catch (error) {
    res.status(400).json({ 
      message: " Gagal mengubah data " + error.message,
      data: null
    });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLesson = await lessonService.deleteLesson(id);

    if (!deletedLesson) {
      return res.status(404).json({
        message: " Gagal menghapus data: ID tidak ditemukan",
        data: null
      });
    }

    res.status(200).json({
      message: " Berhasil menghapus data ",
      data: deletedLesson
    });

  } catch (error) {
    res.status(400).json({ 
      message: " Gagal menghapus data " + error.message,
      data: null
    });
  }
};
