import { Router } from 'express';
import colorController from '../../modules/color.module/controllers/api/color.controller';
import { auth, authorize } from "../../middlewares/index";
const route = Router();

/**
 * @swagger
 * /api/color/create:
 *   post:
 *     summary: Create Colours (Admin only)
 *     tags:
 *       - Category-color
 *     security:
 *       - token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: Create Colour
 *         description: Create Colours.
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - hexCode
 *           properties:
 *             name:
 *               type: string
 *             hexCode:
 *               type: string
 *     responses:
 *        200:
 *          description: Color created successfully
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
*/
route.post('/create', auth, authorize('admin'), colorController.createColor);


/**
 * @swagger
 * /api/color/fetch/all:
 *   get:
 *     summary: Fetch all the colors
 *     tags: 
 *       - Category-color
 *     security:
 *       - token: []
 *     produces: application/json
 *     responses:
 *       200: 
 *         description: All colors fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All colors fetched
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
route.get('/fetch/all', auth, colorController.getAllColors);

/**
 * @swagger
 * /api/color/fetch-by-id/{id}:
 *   get:
 *     summary: Fetch color by id
 *     tags: 
 *       - Category-color
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
 *         description: Colour fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Colour fetched
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
route.get('/fetch-by-id/:id', auth, colorController.getColorById);

/**
 * @swagger
 * /api/color/fetch-by-name/{name}:
 *   get:
 *     summary: Fetch color by name
 *     tags: 
 *       - Category-color
 *     security:
 *       - token: []
 *     produces: application/json
 *     parameters:
 *       - in: path
 *         name: name
 *         type: string
 *         required: true
 *     responses:
 *       200: 
 *         description: Colour fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Colour fetched
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
route.get('/fetch-by-name/:name', auth, colorController.getColorByName);

/**
 * @swagger
 * /api/color/delete/{id}:
 *   delete:
 *     summary: Delete Roles (Admin only)
 *     tags: 
 *       - Category-color
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
route.delete('/delete/:id', auth, authorize('admin'), colorController.deleteColor);

export default route;