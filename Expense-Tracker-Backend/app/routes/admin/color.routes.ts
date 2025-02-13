import { Router } from 'express';
import colorController from '../../modules/color.module/controllers/admin/color.controller';
import { authAdminPanel } from "../../middlewares/index";
import { upload } from 'app/utils';

const router = Router();

/* ------- page routes ------- */
router.get('/expense/colors', authAdminPanel, colorController.colorListPage);
router.get('/expense/color/add', authAdminPanel, colorController.colorCreatePage);


/* ------- admin's api routes ------- */

export default router;