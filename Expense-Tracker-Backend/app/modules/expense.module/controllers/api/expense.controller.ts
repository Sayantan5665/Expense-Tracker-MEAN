import expenseRepository from "../../repositories/expense.repository";
import { IExpense, IMailOptions, ITokenUser } from "../../../../interfaces";
import { Request, Response } from "express";
import { Types } from "mongoose";
import { deleteUploadedDoc, generateStatementPdf, sendEmail } from "../../../../utils";

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

    async getExpenseById(req: Request, res: Response): Promise<any> {
        try {
            const expenseId: string = req.params.id;
            const user: ITokenUser = req.user!;

            const fetchedExpense: any = (await expenseRepository.getExpenses({ userId: new Types.ObjectId(user.id), _id: new Types.ObjectId(expenseId) }, { page: 1, limit: 0, pagination: false })).docs[0];
            if (!fetchedExpense) {
                return res.status(404).json({
                    status: 404,
                    message: "Expense not found",
                });
            }
            return res.status(200).json({
                status: 200,
                message: "Expense fetched successfully",
                data: fetchedExpense
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

    async getAllExpenses(req: Request, res: Response): Promise<any> {
        try {
            const user: ITokenUser = req.user!;
            const page: number = parseInt(req.query.page as string, 10) || 1;
            const limit: number = parseInt(req.query.limit as string, 10) || 0;
            const pagination: boolean = (req.query.pagination as string) == 'false' ? false : true;

            const expenses: any = await expenseRepository.getExpenses({ userId: new Types.ObjectId(user.id) }, { page, limit, pagination });
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

            const dateRange: { startDate?: string | Date, endDate?: string | Date } = {};
            req.query?.startDate && (dateRange.startDate = req.query.startDate as string);
            req.query?.endDate && (dateRange.endDate = req.query.endDate as string);

            const page: number = parseInt(req.query.page as string, 10) || 1;
            const limit: number = parseInt(req.query.limit as string, 10) || 0;
            const pagination: boolean = (req.query.pagination as string) == 'false' ? false : true;

            const expenses = await expenseRepository.getExpensesReport(matchConditions, dateRange, { page, limit, pagination });
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

    async getExpensesByCategoryWise(req: Request, res: Response): Promise<any> {
        try {
            const user: ITokenUser = req.user!;

            const matchConditions: { userId: Types.ObjectId, type: 'cash-in' | 'cash-out' } = { userId: new Types.ObjectId(user.id), type: 'cash-out' };
            if (req.query?.type) {
                matchConditions.type = req.query.type as 'cash-in' | 'cash-out';
            } else {
                return res.status(400).json({
                    status: 400,
                    message: "Type is required",
                });
            }

            const dateRange: { startDate?: string, endDate?: string } = {};
            req.query?.startDate && (dateRange.startDate = req.query.startDate as string);
            req.query?.endDate && (dateRange.endDate = req.query.endDate as string);

            const page: number = parseInt(req.query.page as string, 10) || 1;
            const limit: number = parseInt(req.query.limit as string, 10) || 0;
            const pagination: boolean = (req.query.pagination as string) == 'false' ? false : true;

            const expenses = await expenseRepository.getExpensesCategoryWise(matchConditions, dateRange, { page, limit, pagination });
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
            const expenseId: string = req.params.id;
            const user: ITokenUser = req.user!;

            const fetchedExpense: any = (await expenseRepository.getExpenses({ userId: new Types.ObjectId(user.id), _id: new Types.ObjectId(expenseId) }, { page: 1, limit: 0, pagination: false })).docs[0];
            if (!fetchedExpense) {
                return res.status(404).json({
                    status: 404,
                    message: "Expense not found",
                });
            }
            if (fetchedExpense.userId.toString() !== user.id.toString()) {
                return res.status(403).json({
                    status: 403,
                    message: "You are not authorized to edit this expense",
                });
            }

            const body: IExpense = {
                amount: req.body?.amount || fetchedExpense.amount,
                description: req.body?.description || fetchedExpense.description,
                categoryId: req.body?.categoryId || fetchedExpense?.category?._id.toString(),
                date: req.body?.date || new Date(fetchedExpense.date),
                userId: fetchedExpense?.userId?.toString(),
                type: req.body?.type || fetchedExpense.type,
                documents: fetchedExpense.documents.map((doc: any) => ({ path: doc.path, originalName: doc.originalName })),
            };

            const files: any[] = req?.files as any || [];
            const basePath: string = `${req.protocol}://${req.get('host')}`;
            if (files.length) {
                // upload new files
                const fileArr: Array<{ path: string, originalName: string }> = [];
                for (const file of files) {
                    const filePath = `${basePath}/uploads/expense/${user.id.toString()}/${file.filename}`;
                    fileArr.push({ path: filePath, originalName: file.originalname });
                }
                body.documents = fileArr;
            }

            const newExpense: IExpense | null = await expenseRepository.updateExpenses(new Types.ObjectId(expenseId), body);
            if (!newExpense) {
                return res.status(404).json({
                    status: 404,
                    message: "Expense not found",
                });
            }
            if (files.length > 0) {
                // delete old files
                for (const file of fetchedExpense.documents) {
                    deleteUploadedDoc(user.id, file.path.split('/').pop());
                }
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

    async deleteExpense(req: Request, res: Response): Promise<any> {
        try {
            const expenseId: string = req.params.id;
            const user: ITokenUser = req.user!;

            const fetchedExpense: any = (await expenseRepository.getExpenses({ userId: new Types.ObjectId(user.id), _id: new Types.ObjectId(expenseId) }, { page: 1, limit: 0, pagination: false })).docs[0];
            if (!fetchedExpense) {
                return res.status(404).json({
                    status: 404,
                    message: "Expense not found",
                });
            }
            if (fetchedExpense.userId.toString() !== user.id.toString()) {
                return res.status(403).json({
                    status: 403,
                    message: "You are not authorized to delete this expense",
                });
            }

            const deletedExpense: IExpense | null = await expenseRepository.deleteExpenses({ _id: new Types.ObjectId(expenseId), userId: new Types.ObjectId(user.id) });
            if (!deletedExpense) {
                return res.status(404).json({
                    status: 404,
                    message: "Expense not found",
                });
            }
            // delete uploaded files
            for (const file of fetchedExpense.documents) {
                file && file.path && deleteUploadedDoc(user.id, file.path.split('/').pop() || '');
            }
            return res.status(200).json({
                status: 200,
                message: "Expense deleted successfully",
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


    async exportOrMailStatememt(req: Request, res: Response): Promise<any> {
        try {
            const user: ITokenUser = req.user!;

            const matchConditions: { userId: Types.ObjectId } & Record<string, any> = { userId: new Types.ObjectId(user.id) };
            req.query?.type && (matchConditions.type = req.query.type as string);

            const dateRange: { startDate?: string, endDate?: string } = {};
            req.query?.startDate && (dateRange.startDate = req.query.startDate as string);
            req.query?.endDate && (dateRange.endDate = req.query.endDate as string);

            const page: number = 1;
            const limit: number = parseInt(req.query.limit as string, 10) || 0;
            const pagination: boolean = (req.query.pagination as string) == 'false' ? false : true;

            const sendMail = req.query?.sendMail && (req.query.sendMail as string) == 'true' ? true : false;
            console.log("sendMail: ", sendMail);

            if (limit > 0) {
                delete dateRange.startDate;
                delete dateRange.endDate;
            }

            const expenses = await expenseRepository.getExpensesReport(matchConditions, dateRange, { page, limit, pagination });


            let msg: string = '';
            if (limit > 0) msg = 'last ' + limit + (limit > 1 ? ' transactions' : ' transaction');
            else if (dateRange?.startDate && dateRange?.endDate) {
                msg = 'transactions between ' + new Date(dateRange.startDate as string).toLocaleDateString() + ' and ' + new Date(dateRange.endDate as string).toLocaleDateString();
            }
            if (req.query?.type && req.query?.type.length) {
                if (matchConditions.type == 'cash-out') msg += ' ( Cash Out )';
                else msg += ' ( Cash In )';
            }

            const basePath: string = `${req.protocol}://${req.get('host')}`
            const pdf: Buffer<ArrayBufferLike> = await generateStatementPdf(expenses.docs, msg, basePath, 'generated');

            // Set the response headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=statement-${Date.now()}.pdf`);

            if (sendMail) {
                const mailOptions: IMailOptions = {
                    from: 'no-reply@sayantan.com',
                    to: user.email,
                    subject: 'Cashlytics E-statement',
                    html: `
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">

                            <p style="margin-bottom: 15px;">
                                Dear <strong>${user.name}</strong>,
                            </p>

                            <p style="margin-bottom: 15px;">
                                Your Cashlytics e-statement is now being sent to you as a PDF document.
                                To open this file, you need <strong>Adobe Acrobat Reader</strong>. If you do not have Adobe Acrobat Reader, please visit the following link to download it:
                                <a href="http://www.adobe.com/products/acrobat/readstep2.html" style="color: #007bff; text-decoration: none;">www.adobe.com/products/acrobat/readstep2.html</a>.
                            </p>


                            <p style="margin-bottom: 15px;">
                                Add <strong>estatement@cashlytics.com</strong> to your <strong>white list / safe sender list</strong>. Else, your mailbox filter or ISP (Internet Service Provider) may stop you from receiving your e-mail account statement.
                            </p>

                            <p style="margin-bottom: 15px;">
                                Sincerely,
                                <br>
                                <strong>Team Cashlytics</strong>
                            </p>

                        </body>
                    `,
                    attachments: [{
                        filename: "statement-${Date.now()}.pdf",
                        content: pdf,
                        contentType: "application/pdf"
                    }]
                };
                await sendEmail(mailOptions);
                return res.status(200).json({
                    status: 200,
                    message: "E-statement sent successfully",
                    pdf: pdf,
                })
            } else {
                // Send the PDF buffer as the response
                return res.send(pdf);
            }

        } catch (error: any) {
            console.error("error: ", error);
            return res.status(500).json({
                status: 500,
                message: error.message || "Something went wrong! Please try again.",
                error: error,
            });
        }
    }
}

export default new expenseController();