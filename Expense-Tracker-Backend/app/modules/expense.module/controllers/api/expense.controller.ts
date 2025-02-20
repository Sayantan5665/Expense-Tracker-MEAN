import expenseRepository from "../../repositories/expense.repository";
import { IExpense, ITokenUser } from "../../../../interfaces";
import { Request, Response } from "express";
import { Types } from "mongoose";

class expenseController {
    async createExpense(req: Request, res: Response): Promise<any> {
        try {
            const user: ITokenUser = req.user!;
            const body: IExpense = req.body;
            body.userId = new Types.ObjectId(user.id);

            const newExpense: IExpense = await expenseRepository.addExpense(body);
            return res.status(200).json({
                status: 200,
                data: newExpense,
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
}

export default new expenseController();