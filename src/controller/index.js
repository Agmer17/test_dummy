import { Router } from 'express';
import * as lessonController from './lesson.controller.js';

const router = Router();

// 1. GET ALL
router.get('/curriculum-lessons', lessonController.getAllLessons);

// GET ALL LEGACY (as per user request)
router.get('/get-all/curriculum-lessons', lessonController.getAllLessonsLegacy);

// 2. GET BY ID
router.get('/curriculum-lessons/:id', lessonController.getLessonById);

// 3. POST (Create)
router.post('/curriculum-lessons', lessonController.createLesson);

// 4. PUT (Update)
router.put('/curriculum-lessons/:id', lessonController.updateLesson);

// 5. DELETE (Delete)
router.delete('/curriculum-lessons/:id', lessonController.deleteLesson);

export default router;
