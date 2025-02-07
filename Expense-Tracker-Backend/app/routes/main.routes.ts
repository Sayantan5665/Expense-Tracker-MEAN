import { Router } from "express";
import userRouter from "./api/user.routes";
import roleRouter from "./api/role.routes";
import colorRouter from "./api/color.routes";
import categoryRouter from "./api/category.routes";

const router = Router();

router.use("/api/user", userRouter);
router.use("/api/user/role", roleRouter);
router.use("/api/color", colorRouter);
router.use("/api/category", categoryRouter);

export default router;