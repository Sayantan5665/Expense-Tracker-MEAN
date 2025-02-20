import { Router } from 'express';
import aboutController from '../../modules/about.module/controllers/admin/about.controller';
import { authAdminPanel } from "../../middlewares/index";
import { uploadImage } from '../../utils';

const router = Router();

/* ------- page routes ------- */
router.get('/cms/about', authAdminPanel, aboutController.aboutCmsPage);


/* ------- admin's api routes ------- */
// router.post('/admin/user/login', loggedInGuard, userController.login);
// router.post('/admin/user/forgot-password', loggedInGuard, userController.forgotPassword);
// router.get('/admin/user/confirm/forgot-password/:token', userController.confirmPasswordChange);
// router.post('/admin/user/update/profile/:id', authAdminPanel, upload.single('image'), userController.updateUserProfile);
// router.get('/admin/user/logout', authAdminPanel, userController.logout);
// router.get('/admin/change/user/status/:userId', authAdminPanel, userController.activeDeactiveUser)

export default router;