import { Document, Types } from "mongoose";
import { IRole } from "./role.interface";

export interface IUser extends Document {
    _id: string;
    id?: string;
    image: string;
    name: string;
    email: string;
    password: string;
    role: IRole;
    isVarified: boolean;
    isActive: boolean;
    confirmPassword?: string;
    timeZone: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ITokenUser {
    id: string;
    name: string;
    image: string;
    email: string;
    role: IRole;
    isVarified?: boolean;
    createdAt?: string;
    timeZone?: string;
}

export interface IMailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
    attachments?: Array<{
        filename: string;
        content: Buffer;
        contentType?: string,
    }>;
}

export interface IVerificationToken {
    email: string;
    password?: string;
}