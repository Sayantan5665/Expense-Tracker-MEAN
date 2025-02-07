import { Router } from "express";
const router = Router();

/* +++++ api's imports +++++ */
import userRouter from "./api/user.routes";
import roleRouter from "./api/role.routes";
import colorRouter from "./api/color.routes";
import categoryRouter from "./api/category.routes";

/* +++++ admin panel's imports +++++ */
import dashboardRouter from "./admin/dashboard.routes";

/* +++++ for api +++++ */
router.use("/api/user", userRouter);
router.use("/api/user/role", roleRouter);
router.use("/api/color", colorRouter);
router.use("/api/category", categoryRouter);

/* +++++ for admin panel +++++ */
router.use("/", dashboardRouter);

export default router;