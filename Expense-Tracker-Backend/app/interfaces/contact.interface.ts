import { Document } from "mongoose";

export interface IContact extends Document {
    name: string,
    email: string,
    message: string,
    status: 'pending' | 'in-progress' | 'resolved'
}