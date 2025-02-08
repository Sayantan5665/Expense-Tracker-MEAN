import { Router } from 'express';
import userController from '../../modules/user.module/controllers/admin/user.controller';
import { authAdminPanel, loggedInGuard } from "../../middlewares/index";

const router = Router();

/* ------- page routes ------- */
router.get('/login', loggedInGuard, userController.loginPage);
// router.get('/register', loggedInGuard, userController.registrationPage);

/* ------- admin's api routes ------- */
router.post('/admin/user/login', loggedInGuard, userController.login);
// router.put('/admin/user/update/:id', authAdminPanel, userController.updateUser);
// router.get('/admin/user/fetch/all', authAdminPanel, userController.fetchAllUsers);
// router.get('/admin/user/fetch/:id', authAdminPanel, userController.fetchUserById);

export default router;