import { Router } from 'express';
import colorController from '../../modules/color.module/controllers/admin/color.controller';
import { authAdminPanel } from "../../middlewares/index";
import { upload } from 'app/utils';

const router = Router();

/* ------- page routes ------- */
router.get('/expense/colors', authAdminPanel, colorController.colorListPage);


/* ------- admin's api routes ------- */

export default router;