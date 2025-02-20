import { model, Model, Schema } from "mongoose";
import { IExpense } from "../../../interfaces";
import Joi, { ObjectSchema } from "joi";


const expenseValidator: ObjectSchema<IExpense> = Joi.object({
    amount: Joi.number().required(),
    description: Joi.string().required(),
    categoryId: Joi.string().required(),
    date: Joi.date(),
    userId: Joi.string().required(),
    type: Joi.string().valid('cash-in', 'cash-out').required(),
    documents: Joi.array().items(Joi.object({
        path: Joi.string().required(),
        originalName: Joi.string().required()
    }))
});


const expenseSchema: Schema<IExpense> = new Schema({
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
        path: { type: String, required: true },
        originalName: { type: String, required: true }
    }]
}, { timestamps: true, versionKey: false });


const expenseModel: Model<IExpense> = model('Expense', expenseSchema);

export { expenseModel, expenseValidator };
export default expenseModel;