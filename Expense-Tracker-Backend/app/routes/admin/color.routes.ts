import { Router } from 'express';
import colorController from '../../modules/color.module/controllers/admin/color.controller';
import { authAdminPanel } from "../../middlewares/index";

const router = Router();

/* ------- page routes ------- */
router.get('/expense/colors', authAdminPanel, colorController.colorListPage);
router.get('/expense/color/add', authAdminPanel, colorController.colorCreatePage);

/* ------- admin's api routes ------- */
router.post('/admin/color/add', authAdminPanel, colorController.colorCreate);
router.get('/admin/color/delete/:id', authAdminPanel, colorController.deleteColor);

export default router;