import { Model, Schema, model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import { IColor } from "../../../interfaces/index";


const colorValidator: ObjectSchema<IColor> = joi.object({
    name: joi.string().required(),
    hexCode: joi.string().required()
});

const colorSchema: Schema<IColor> = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    hexCode: {
        type: String,
        required: true,
        unique: true,
    },
}, { timestamps: true, versionKey: false });

const colorModel: Model<IColor> = model('Color', colorSchema);

export { colorModel, colorValidator };
export default colorModel;