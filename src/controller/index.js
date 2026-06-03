import { Router } from 'express';
// Gunakan default import karena di filenya kamu pakai 'export default router'
import lessonRouter from './lesson.controller.js'; 
import userRouter from './user_router.js';

const router = Router();

// Hati-hati dengan penamaan path di sini!
router.use("/curriculum-lessons", lessonRouter);

// user endpoint 
router.use("/user", userRouter);

export default router;