import { Router } from 'express';
import contactController from '../../modules/contact-us.module/controllers/admin/contact-us.controller';
import { authAdminPanel } from "../../middlewares/index";
import { uploadImage } from '../../utils';

const router = Router();

/* ------- page routes ------- */
router.get('/cms/contact-us', authAdminPanel, contactController.contactCmsPage);


/* ------- admin's api routes ------- */
// router.post('/admin/user/login', loggedInGuard, userController.login);
// router.post('/admin/user/forgot-password', loggedInGuard, userController.forgotPassword);
// router.get('/admin/user/confirm/forgot-password/:token', userController.confirmPasswordChange);
// router.post('/admin/user/update/profile/:id', authAdminPanel, upload.single('image'), userController.updateUserProfile);
// router.get('/admin/user/logout', authAdminPanel, userController.logout);
// router.get('/admin/change/user/status/:userId', authAdminPanel, userController.activeDeactiveUser)

export default router;