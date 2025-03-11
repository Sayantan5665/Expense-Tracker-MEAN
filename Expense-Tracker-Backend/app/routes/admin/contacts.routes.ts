import { Router } from "express";
import contactController from "../../modules/contact.module/controllers/admin/contact.controller";
import { authAdminPanel } from "../../middlewares";

const router = Router();

router.get('/contact-requests', authAdminPanel, contactController.contactsPage);
router.put('/contact/update-status/:id', authAdminPanel, contactController.updateContactStatus);
router.delete('/contact/delete/:id', authAdminPanel, contactController.deleteContact);


export default router;