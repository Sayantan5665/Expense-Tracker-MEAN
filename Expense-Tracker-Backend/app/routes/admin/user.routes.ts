import { Router } from 'express';
import userController from '../../modules/user.module/controllers/admin/user.controller';
import { authAdminPanel, loggedInGuard } from "../../middlewares/index";

const router = Router();

/* ------- page routes ------- */
router.get('/login', loggedInGuard, userController.loginPage);
// router.get('/register', loggedInGuard, userController.registrationPage);
router.get('/forgot-password', loggedInGuard, userController.forgotPasswordPage);
router.get('/profile', authAdminPanel, userController.profilePage);

/* ------- admin's api routes ------- */
router.post('/admin/user/login', loggedInGuard, userController.login);
router.post('/admin/user/forgot-password', loggedInGuard, userController.forgotPassword);
router.get('/admin/user/confirm/forgot-password/:token', userController.confirmPasswordChange);
router.get('/admin/user/logout', authAdminPanel, userController.logout);

export default router;