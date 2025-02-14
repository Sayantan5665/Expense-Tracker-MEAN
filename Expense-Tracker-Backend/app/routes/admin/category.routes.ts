import { Router } from 'express';
import categoryController from '../../modules/category.module/controllers/admin/category.controller';
import { authAdminPanel } from "../../middlewares/index";

const router = Router();

/* ------- page routes ------- */
router.get('/expense/categories', authAdminPanel, categoryController.categoryListPage);
router.get('/expense/category/add', authAdminPanel, categoryController.categoryCreatePage);
router.get('/expense/category/edit/:id', authAdminPanel, categoryController.categoryEditPage);

/* ------- admin's api routes ------- */
router.post('/admin/category/add', authAdminPanel, categoryController.categoryAdd);
router.post('/admin/category/edit/:id', authAdminPanel, categoryController.editCcategory);
router.get('/admin/category/delete/:id', authAdminPanel, categoryController.deleteCategory);

export default router;