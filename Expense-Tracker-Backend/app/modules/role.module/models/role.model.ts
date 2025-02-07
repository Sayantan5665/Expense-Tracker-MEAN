import { Model, Schema, model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import { IRole } from "../../../interfaces/index";


const roleValidator: ObjectSchema<IRole> = joi.object({
    role: joi.string().required(),
    roleDisplayName: joi.string().required(),
    rolegroup: joi.string().required(),
    description: joi.string().required()
});

const roleSchema: Schema<IRole> = new Schema({
    role: {
        type: String,
        enum: ["admin", "user"],
        unique: true,
        default: 'user'
    },
    roleDisplayName: {
        type: String,
        required: true
    },
    rolegroup: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true, versionKey: false });

const roleModel: Model<IRole> = model('Role', roleSchema);

export { roleModel, roleValidator };
export default roleModel;