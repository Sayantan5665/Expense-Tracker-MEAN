import { Model, Schema, model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import { IContact } from "../../../interfaces/index";


const contactValidator: ObjectSchema<IContact> = joi.object({
    name: joi.string().required(),
    email: joi.string().required(),
    message: joi.string().required(),
    status: joi.string().required()
});

const contactSchema: Schema<IContact> = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['complete', 'ignored', 'due'],
        default: 'due'
    }
}, { timestamps: true, versionKey: false });

const contactModel: Model<IContact> = model('Contact', contactSchema);

export { contactModel, contactValidator };
export default contactModel;