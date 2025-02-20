import { Router } from 'express';
import userController from '../../modules/user.module/controllers/admin/user.controller';
import { authAdminPanel, loggedInGuard } from "../../middlewares/index";
import { uploadImage } from '../../utils';

const router = Router();

/* ------- page routes ------- */
router.get('/login', loggedInGuard, userController.loginPage);
// router.get('/register', loggedInGuard, userController.registrationPage);
router.get('/forgot-password', loggedInGuard, userController.forgotPasswordPage);
router.get('/profile', authAdminPanel, userController.profilePage);
router.get('/users-list', authAdminPanel, userController.usrListPage);

/* ------- admin's api routes ------- */
router.post('/admin/user/login', loggedInGuard, userController.login);
router.post('/admin/user/forgot-password', loggedInGuard, userController.forgotPassword);
router.get('/admin/user/confirm/forgot-password/:token', userController.confirmPasswordChange);
router.post('/admin/user/update/profile/:id', authAdminPanel, uploadImage.single('image'), userController.updateUserProfile);
router.get('/admin/user/logout', authAdminPanel, userController.logout);
router.get('/admin/change/user/status/:userId', authAdminPanel, userController.activeDeactiveUser)

export default router;