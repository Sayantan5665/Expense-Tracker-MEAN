import { Model, Schema, model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import { ICategory } from "../../../interfaces/index";


const categoryValidator: ObjectSchema<ICategory> = joi.object({
    name: joi.string().required(),
    userId: joi.string().required(),
    isDefault: joi.boolean(),
    colorId: joi.string().required(),
    description: joi.string().required(),
});

const categorySchema: Schema<ICategory> = new Schema({
    name: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    colorId: {
        type: Schema.Types.ObjectId,
        ref: 'Color',
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
}, { timestamps: true, versionKey: false });

const categoryModel: Model<ICategory> = model('Category', categorySchema);

export { categoryModel, categoryValidator };
export default categoryModel;