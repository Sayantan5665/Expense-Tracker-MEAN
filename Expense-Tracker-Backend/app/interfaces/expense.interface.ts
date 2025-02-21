import { Document, Types } from "mongoose";


export interface IColor extends Document {
    name: string,
    hexCode: string
}

export interface ICategory extends Document {
    name: string,
    userId: Types.ObjectId,
    colorId: Types.ObjectId,
    isDefault: boolean,
    description: string
}

export interface IExpense {
    amount: number;
    description: string;
    categoryId: Types.ObjectId;
    date: Date;
    userId: Types.ObjectId;
    type: 'cash-in' | 'cash-out';
    documents: Array<{path: String, originalName: String}>;
}