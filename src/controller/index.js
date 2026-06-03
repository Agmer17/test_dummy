import { Router } from 'express';
import lessonRouter from './lesson.controller.js'; // ini udah bener, filenya ada
import userRouter from './user_router.js';

const router = Router();

router.use("/curriculum-lessons", lessonRouter); // prefix di sini
router.use("/user", userRouter);


router.get("/", async (req, res) => {
    res.json({message : "hello"})
})

export default router;