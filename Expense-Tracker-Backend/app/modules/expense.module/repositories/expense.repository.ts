import { expenseModel, expenseValidator } from "../models/expense.model";
import { IExpense } from "../../../interfaces";
import { Types } from "mongoose";

class expenseRepository {
    async addExpense(body: IExpense): Promise<IExpense> {
        try {
            const { error } = expenseValidator.validate(body);
            if (error) throw error;

            const data = new expenseModel(body);
            const newExpense: IExpense = await data.save();
            return newExpense;
        } catch (error:any) {
            throw new Error(error.message || "Something went wrong");
        }
    }
}

export default new expenseRepository();
