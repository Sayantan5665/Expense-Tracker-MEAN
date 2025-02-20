import { model, Model, Schema } from "mongoose";
import { IExpense } from "../../../interfaces";
import Joi, { ObjectSchema } from "joi";


const expenseValidator:ObjectSchema<IExpense> = Joi.object({
    amount: Joi.number().required().min(0),
    description: Joi.string().required(),
    categoryId: Joi.string().required(),
    date: Joi.date(),
    userId: Joi.string().required(),
    type: Joi.string().required().valid('cash-in', 'cash-out'),
    documents: Joi.array().items(Joi.string())
});


const expenseSchema:Schema<IExpense> = new Schema({
    amount: {
        type: Number,
        required: true,
        min: 0,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    date: {
        type: Date,
        default: Date.now(),
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        enum: ['cash-in', 'cash-out'],
        required: true,
        index: true
    },
    documents: [{
        type: String
    }]
}, {timestamps: true, versionKey:false});


const expenseModel: Model<IExpense> = model('Expense', expenseSchema);

export { expenseModel, expenseValidator };
export default expenseModel;