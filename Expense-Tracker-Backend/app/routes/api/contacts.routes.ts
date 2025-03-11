import { Router } from "express";
import contactController from "../../modules/contact.module/controllers/api/contact.controller";

const router = Router();

/**
 * @swagger
 * /api/contact/send-request:
 *   post:
 *     summary: Send a request for contact
 *     tags:
 *       - Contact-Us
 *     security:
 *       - token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: Send a request for contact
 *         description: Send a request for contact.
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - email
 *             - message
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             message:
 *               type: string
 *     responses:
 *        200:
 *          description: Color created successfully
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
*/
router.post("/send-request", contactController.createContact);

export default router;