import { Router } from 'express';
import expenseController from '../../modules/expense.module/controllers/api/expense.controller';
import { auth } from "../../middlewares/index";
import { uploadDoc } from '../../utils';
const route = Router();

/**
 * @swagger
 * /api/expense/add:
 *   post:
 *     summary: Add a new expense
 *     tags:
 *       - Expenses
 *     security:
 *       - token: []
 *     produces:
 *       - application/json
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: documents
 *         description: "Array of files to upload"
 *         type: array
 *         items:
 *           type: file
 *         required: false
 *       - in: formData
 *         name: amount
 *         description: "Expense amount"
 *         type: number
 *         required: true
 *       - in: formData
 *         name: description
 *         description: "Description of the expense"
 *         type: string
 *         required: true
 *       - in: formData
 *         name: categoryId
 *         description: "Category ID (ObjectId)"
 *         type: string
 *         required: true
 *       - in: formData
 *         name: date
 *         description: "Date of the expense (YYYY-MM-DD)"
 *         type: string
 *         format: date
 *         required: false
 *       - in: formData
 *         name: type
 *         description: "Type of the expense"
 *         type: string
 *         enum:
 *           - cash-in
 *           - cash-out
 *         required: true
 *     responses:
 *       200:
 *         description: New expense added successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
route.post('/add', auth, uploadDoc.array('documents', 5), expenseController.createExpense);

/**
 * @swagger
 * /api/expense/fetch-by-id/{id}:
 *   get:
 *     summary: fetch all expenses
 *     tags:
 *       - Expenses
 *     security: 
 *       - token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200: 
 *         description: Fetched all expenses successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fetched all expenses successfully.
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
route.get('/fetch-by-id/:id', auth, expenseController.getExpenseById);

/**
 * @swagger
 * /api/expense/fetch/all:
 *   get:
 *     summary: Fetch expenses with pagination
 *     tags:
 *       - Expenses
 *     security: 
 *       - token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: boolean
 *         description: Set true if pagination is needed
 *     responses:
 *       200: 
 *         description: Fetched expenses successfully.
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */

route.get('/fetch/all', auth, expenseController.getAllExpenses);


/**
 * @swagger
 * /api/expense/fetch-by-filter-with-report:
 *   get:
 *     summary: Fetch expenses by filter by type, category, start date, end date
 *     tags:
 *       - Expenses
 *     security: 
 *       - token: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         type: string
 *         description: Filter expenses by category
 *       - in: query
 *         name: type
 *         type: string
 *         enum: [cash-in, cash-out]
 *         description: Filter expenses by type
 *       - in: query
 *         name: startDate
 *         type: string
 *         format: date
 *         description: Filter expenses by start date
 *       - in: query
 *         name: endDate
 *         type: string
 *         format: date
 *         description: Filter expenses by end date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: boolean
 *         description: Set true if pagination is needed
 *     responses:
 *       200: 
 *         description: Fetched expenses successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fetched expenses successfully.
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
route.get('/fetch-by-filter-with-report', auth, expenseController.getExpensesAndReport);

/**
 * @swagger
 * /api/expense/fetch-by-category-wise:
 *   get:
 *     summary: Fetch expenses by category wise
 *     tags:
 *       - Expenses
 *     security:
 *       - token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: type
 *         type: string
 *         enum:
 *           - cash-in
 *           - cash-out
 *         description: "Type of the expense (Required)"
 *         required: true
 *       - in: query
 *         name: startDate
 *         type: string
 *         format: date
 *         description: "Start date for filtering expenses (YYYY-MM-DD)"
 *       - in: query
 *         name: endDate
 *         type: string
 *         format: date
 *         description: "End date for filtering expenses (YYYY-MM-DD)"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: boolean
 *         description: Set true if pagination is needed
 *     responses:
 *       200:
 *         description: Expenses fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Expenses fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60c72b2f9b1d8e3f5a4d8f8b"
 *                       amount:
 *                         type: number
 *                         example: 1000
 *                       description:
 *                         type: string
 *                         example: "Grocery shopping"
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2025-02-21"
 *                       type:
 *                         type: string
 *                         enum: [cash-in, cash-out]
 *                         example: "cash-out"
 *                       category:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60c72b2f9b1d8e3f5a4d8f8c"
 *                           name:
 *                             type: string
 *                             example: "Groceries"
 *       400:
 *         description: Bad Request - Type is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Type is required
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Something went wrong! Please try again.
 */
route.get('/fetch-by-category-wise', auth, expenseController.getExpensesByCategoryWise);

/**
 * @swagger
 * /api/expense/edit/{id}:
 *   put:
 *     summary: Edit an existing expense
 *     tags:
 *       - Expenses
 *     security:
 *       - token: []
 *     produces:
 *       - application/json
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the expense to edit
 *       - in: formData
 *         name: documents
 *         description: "Array of files to upload"
 *         type: array
 *         items:
 *           type: file
 *       - in: formData
 *         name: date
 *         description: "Date of the expense (YYYY-MM-DD)"
 *         type: string
 *         format: date
 *       - in: formData
 *         name: amount
 *         description: "Expense amount"
 *         type: number
 *       - in: formData
 *         name: description
 *         description: "Description of the expense"
 *         type: string
 *       - in: formData
 *         name: type
 *         description: "Type of the expense"
 *         type: string
 *         enum:
 *           - cash-in
 *           - cash-out
 *       - in: formData
 *         name: categoryId
 *         description: "Category ID (ObjectId)"
 *         type: string
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       400:
 *         description: Bad Request
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Server Error
 */
route.put('/edit/:id', auth, uploadDoc.array('documents', 5), expenseController.editExpense);


/**
 * @swagger
 * /api/expense/delete/{id}:
 *   delete:
 *     summary: Delete expenses
 *     tags: 
 *       - Expenses
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
 *         description: Expense deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Expense deleted successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
route.delete('/delete/:id', auth, expenseController.deleteExpense);


/**
 * @swagger
 * /api/expense/export-statement:
 *   get:
 *     summary: Export statement by filter by type, category, start date, end date
 *     tags:
 *       - Expenses
 *     security: 
 *       - token: []
 *     parameters:
 *       - in: query
 *         name: type
 *         type: string
 *         enum: [cash-in, cash-out]
 *         description: Filter expenses by type
 *       - in: query
 *         name: startDate
 *         type: string
 *         format: date
 *         description: Filter expenses by start date
 *       - in: query
 *         name: endDate
 *         type: string
 *         format: date
 *         description: Filter expenses by end date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: sendMail
 *         schema:
 *           type: boolean
 *         description: Set true if You want to send the statement in mail
 *     responses:
 *       200: 
 *         description: Statement exported successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Statement exported successfully.
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
route.get('/export-statement', auth, expenseController.exportOrMailStatememt);


export default route;