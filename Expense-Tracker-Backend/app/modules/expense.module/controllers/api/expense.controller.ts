import expenseRepository from "../../repositories/expense.repository";
import { IExpense, ITokenUser } from "../../../../interfaces";
import { Request, Response } from "express";
import { Types } from "mongoose";
import { deleteUploadedDoc } from "../../../../utils";

class expenseController {
    async createExpense(req: Request, res: Response): Promise<any> {
        try {
            const user: ITokenUser = req.user!;
            const body: any = req.body;
            body.userId = user.id;

            const files: any[] = req?.files as any || [];
            const basePath: string = `${req.protocol}://${req.get('host')}`;
            if (files.length) {
                const fileArr: Array<{ path: string, originalName: string }> = [];
                for (const file of files) {
                    const fileName = file.filename;
                    const filePath = `${basePath}/uploads/expense/${user.id.toString()}/${fileName}`;
                    fileArr.push({ path: filePath, originalName: file.originalname });
                }
                body.documents = fileArr;
            }

            const newExpense: IExpense = await expenseRepository.addExpense(body);
            return res.status(200).json({
                status: 200,
                data: newExpense,
            });

        } catch (error: any) {
            console.error("error: ", error);
            const user: ITokenUser = req.user!;
            const files: any[] = req?.files as any || [];
            if (files.length) {
                for (const file of files) {
                    deleteUploadedDoc(user.id, file.filename)
                }
            }
            return res.status(500).json({
                status: 500,
                message: error.message || "Something went wrong! Please try again.",
                error: error,
            });
        }
    }

    async getAllExpenses(req: Request, res: Response): Promise<any> {
        try {
            const user: ITokenUser = req.user!;
            const expenses: IExpense[] = await expenseRepository.getExpenses({userId: new Types.ObjectId(user.id)});
            return res.status(200).json({
                status: 200,
                message: "Expenses fetched successfully",
                data: expenses,
            });
        } catch (error: any) {
            console.error("error: ", error);
            return res.status(500).json({
                status: 500,
                message: error.message || "Something went wrong! Please try again.",
                error: error,
            });
        }
    }


    /**
   * Retrieves a report of expenses based on the provided match conditions and date range.
   *
   * @query type - The optional type for filtering expenses [cash-in & cash-out].
   * @query categoryId - The optional categoryId to filter expenses by category.
   * @query startDate - The optional startDate to filter expenses from startDate.
   * @query endDate - The optional endDate to filter expenses to endDate.
   * @returns A promise that resolves to an array of IExpense objects containing the report data.
   */
    async getExpensesAndReport(req: Request, res: Response): Promise<any> {
        try {
            const user: ITokenUser = req.user!;

            const matchConditions: { userId: Types.ObjectId } & Record<string, any> = { userId: new Types.ObjectId(user.id) };
            req.query?.type && (matchConditions.type = req.query.type as string);
            req.query?.categoryId && (matchConditions.categoryId = new Types.ObjectId(req.query.categoryId as string));

            const dateRange:{startDate?: string, endDate?: string} = {};
            req.query?.startDate && (dateRange.startDate = req.query.startDate as string);
            req.query?.endDate && (dateRange.endDate = req.query.endDate as string);

            const expenses: IExpense[] = await expenseRepository.getExpensesReport(matchConditions, dateRange);
            return res.status(200).json({
                status: 200,
                message: "Expenses fetched successfully",
                data: expenses,
            });
        } catch (error: any) {
            console.error("error: ", error);
            return res.status(500).json({
                status: 500,
                message: error.message || "Something went wrong! Please try again.",
                error: error,
            });
        }
    }


    async editExpense(req: Request, res: Response): Promise<any> {
        try {
            const expenseId:string = req.params.id;
            const user: ITokenUser = req.user!;
            const body: any = req.body;

            const fetchedExpense: any = (await expenseRepository.getExpenses({userId: new Types.ObjectId(user.id), _id: new Types.ObjectId(expenseId)}))[0];
            if (!fetchedExpense) {
                return res.status(404).json({
                    status: 404,
                    message: "Expense not found",
                });
            }
            if(fetchedExpense.userId.toString() !== user.id.toString()) {
                return res.status(403).json({
                    status: 403,
                    message: "You are not authorized to edit this expense",
                });
            }
            body.userId = fetchedExpense.userId;

            const files: any[] = req?.files as any || [];
            const basePath: string = `${req.protocol}://${req.get('host')}`;
            if (files.length) {
                // upload new files
                const fileArr: Array<{ path: string, originalName: string }> = [];
                for (const file of files) {
                    const fileName = Date.now() + '-' + file.originalname;
                    const filePath = `${basePath}/uploads/expense/${user.id.toString()}/${fileName}`;
                    fileArr.push({ path: filePath, originalName: file.originalname });
                }
                body.documents = fileArr;
            }

            const newExpense: IExpense | null = await expenseRepository.updateExpenses(new Types.ObjectId(expenseId) ,body);
            if (!newExpense) {
                return res.status(404).json({
                    status: 404,
                    message: "Expense not found",
                });
            }
            return res.status(200).json({
                status: 200,
                data: newExpense,
            });

        } catch (error: any) {
            console.error("error: ", error);
            const user: ITokenUser = req.user!;
            const files: any[] = req?.files as any || [];
            if (files.length) {
                for (const file of files) {
                    deleteUploadedDoc(user.id, file.filename)
                }
            }
            return res.status(500).json({
                status: 500,
                message: error.message || "Something went wrong! Please try again.",
                error: error,
            });
        }
    }

    async deleteExpense(req: Request, res: Response): Promise<any> {}
}

export default new expenseController();