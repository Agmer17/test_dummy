import { Router } from 'express';
import lessonRouter from './lesson.controller.js'; // ini udah bener, filenya ada
import userRouter from './user_router.js';
import reviewRouter from './review_router.js';
import passwordPlacementRouter from './placement_password_router.js';
import paymentRouter from "./payment_router.js";
import packageRouter from "./package_router.js";
import subscriptionRouter from "./subscription_router.js";

const router = Router();

router.use("/curriculum-lessons", lessonRouter); // prefix di sini
router.use("/users", userRouter);
router.use("/reviews", reviewRouter);
router.use("/password-placement", passwordPlacementRouter)
router.use("/payment", paymentRouter)
router.use("/package", packageRouter)
router.use("/subscription", subscriptionRouter)

export default router;