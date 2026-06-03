import { Router } from 'express';
import lessonRouter from './lesson.controller.js'; // ini udah bener, filenya ada
import userRouter from './user_router.js';
import reviewRouter from './review_router.js';

const router = Router();

router.use("/curriculum-lessons", lessonRouter); // prefix di sini
router.use("/users", userRouter);
router.use("/reviews", reviewRouter);

export default router;