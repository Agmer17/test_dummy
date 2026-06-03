import { Router } from 'express';
import lessonRouter from './lesson.controller.js'; // ini udah bener, filenya ada
import userRouter from './user_router.js';
import reviewRouter from './review_router.js';
import passwordPlacementRouter from './placement_password_router.js';
import paymentRouter from "./payment_router.js";
import packageRouter from "./package_router.js";
import subscriptionRouter from "./subscription_router.js";
import readingRouter from './reading.controller.js';
import readingProgressRouter from './reading_progress.controller.js';
import folderRouter from './folder.controller.js';
import materialRouter from './material.controller.js';
import studentRouter from './student.controller.js';
import sessionRouter from './session.controller.js';

const router = Router();

router.use("/curriculum-lessons", lessonRouter); // prefix di sini
router.use("/users", userRouter);
router.use("/reviews", reviewRouter);
router.use("/password-placement", passwordPlacementRouter)
router.use("/payment", paymentRouter)
router.use("/package", packageRouter)
router.use("/subscription", subscriptionRouter)
router.use("/reading-drills", readingRouter);
router.use("/user-reading-progress", readingProgressRouter);
router.use("/folders", folderRouter);
router.use("/materials", materialRouter);
router.use("/students", studentRouter);
router.use("/sessions", sessionRouter);


router.get("/", async (req, res) => {
    res.json({message : "hello"})
})

export default router;