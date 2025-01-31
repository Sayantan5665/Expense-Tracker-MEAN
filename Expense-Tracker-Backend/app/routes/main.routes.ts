import { Router } from "express";
import userRouter from "./api/user.routes";
import roleRouter from "./api/role.routes";

const router = Router();

router.use("/api/user", userRouter);
router.use("/api/user/role", roleRouter)

export default router;