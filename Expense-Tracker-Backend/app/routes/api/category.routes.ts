import { Router } from 'express';
import categoryController from '../../modules/category.module/controllers/api/category.controller';
import { auth } from "../../middlewares/index";
const route = Router();

/**
 * @swagger
 * /api/category/create:
 *   post:
 *     summary: Create Categories
 *     tags:
 *       - Category
 *     security:
 *       - token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: Create Category
 *         description: Create Categories.
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - colorId
 *             - description
 *           properties:
 *             name:
 *               type: string
 *             colorId:
 *               type: string
 *             isDefault:
 *               type: boolean
 *             description:
 *               type: string
 *     responses:
 *        200:
 *          description: Category created successfully
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
*/
route.post('/create', auth, categoryController.createCategory);


/**
 * @swagger
 * /api/category/fetch/all:
 *   get:
 *     summary: Fetch all the categories
 *     tags: 
 *       - Category
 *     security:
 *       - token: []
 *     produces: application/json
 *     parameters:
 *       - in: query
 *         name: yourOwn
 *         schema:
 *           type: boolean
 *         description: Set true if only need users their own category
 *     responses:
 *       200: 
 *         description: All categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All categories fetched
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
route.get('/fetch/all', auth, categoryController.getAllCategories);

/**
 * @swagger
 * /api/category/fetch-by-id/{id}:
 *   get:
 *     summary: Fetch category by id
 *     tags: 
 *       - Category
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
 *         description: Category fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category fetched
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
route.get('/fetch-by-id/:id', auth, categoryController.getCategoryById);

/**
 * @swagger
 * /api/category/edit/{id}:
 *   put:
 *     summary: Edit Categories
 *     tags:
 *       - Category
 *     security:
 *       - token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *       - in: body
 *         name: Edit Category
 *         description: Edit Categories.
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - colorId
 *             - description
 *           properties:
 *             name:
 *               type: string
 *             colorId:
 *               type: string
 *             isDefault:
 *               type: boolean
 *             description:
 *               type: string
 *     responses:
 *        200:
 *          description: Category updated successfully
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
*/
route.put('/edit/:id', auth, categoryController.editCcategory);

/**
 * @swagger
 * /api/category/delete/{id}:
 *   delete:
 *     summary: Delete Categories (Only themselves)
 *     tags: 
 *       - Category
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
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category deleted successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
route.delete('/delete/:id', auth, categoryController.deleteCategory);

export default route;