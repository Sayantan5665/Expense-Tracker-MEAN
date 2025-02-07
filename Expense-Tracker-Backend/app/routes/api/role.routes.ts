import { Router } from 'express';
import roleController from '../../modules/role.module/controllers/api/role.controller';
import { auth, authorize } from "../../middlewares/index";
const route = Router();

/**
 * @swagger
 * /api/user/role/create:
 *   post:
 *     summary: Create Roles (Admin only)
 *     tags:
 *       - Auth
 *     security:
 *       - token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: Create Role
 *         description: Create Roles.
 *         schema:
 *           type: object
 *           required:
 *             - role
 *             - roleDisplayName
 *             - rolegroup
 *             - description
 *           properties:
 *             role:
 *               type: string
 *             roleDisplayName:
 *               type: string
 *             rolegroup:
 *               type: string
 *             description:
 *               type: string
 *     responses:
 *        200:
 *          description: Role created successfully
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
*/
route.post('/create', auth, authorize('admin'), roleController.createRole);


/**
 * @swagger
 * /api/user/role/fetch:
 *   get:
 *     summary: Fetch all the roles
 *     tags: 
 *       - Auth
 *     security:
 *       - token: []
 *     produces: application/json
 *     responses:
 *       200: 
 *         description: All roles fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All roles fetched
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
route.get('/fetch', auth, roleController.getRoles);

/**
 * @swagger
 * /api/user/role/delete/{id}:
 *   delete:
 *     summary: Delete roles (Admin only)
 *     tags: 
 *       - Auth
 *     security:
 *       - token: []
 *     produces: application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *     responses:
 *       200: 
 *         description: Role deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Role deleted successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
route.delete('/delete/:id', auth, authorize('admin'), roleController.deleteRole);

export default route;