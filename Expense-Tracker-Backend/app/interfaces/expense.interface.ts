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