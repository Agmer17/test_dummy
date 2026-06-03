import mongoose from 'mongoose';

const curriculumLessonSchema = new mongoose.Schema({
  // Kamu bisa mengosongkannya atau mengisi beberapa field sebagai acuan saja
}, { 
  strict: false, // Mengizinkan pembacaan data dengan struktur dinamis/fleksibel
  timestamps: true 
});

// PENTING: Argumen ketiga ('curriculum_lessons') memaksa Mongoose 
// untuk menggunakan nama collection ini secara persis, bukan menebaknya.
export default mongoose.model('CurriculumLesson', curriculumLessonSchema, 'curriculum_lessons');