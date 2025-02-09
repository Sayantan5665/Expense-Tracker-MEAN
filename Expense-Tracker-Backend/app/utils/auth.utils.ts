import { sign, verify } from "jsonwebtoken";
import { compare, genSaltSync, hashSync } from "bcryptjs";
import { ITokenUser, IVerificationToken } from "../interfaces/user.interface";




export const hashPassword = async (password: string): Promise<string> => {
    try {
        const salt = genSaltSync(10);
        return hashSync(password, salt);
    } catch (error: any) {
        throw new Error(error.message || 'Something went wrong during hashing your password!');
    }
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    try {
        return await compare(password, hashedPassword)
    } catch (error: any) {
        throw new Error(error.message || 'Something went wrong during varifying your password!');
    }
}


export const generateToken = async (user: ITokenUser | IVerificationToken): Promise<string> => {
    try {
        const token = sign(user, process.env.JWT_SECRET!, { expiresIn: '1d' });
        return token;
    } catch (error: any) {
        throw new Error(error.message || 'Something went wrong during generating token!');
    }
}

export const verifyToken = async (token: string): Promise<ITokenUser | IVerificationToken | null> => {
    try {
        const user: ITokenUser | IVerificationToken | null = verify(token, process.env.JWT_SECRET!) as any ;
        return user;
    } catch (error: any) {
        throw new Error(error.message || 'Invalid or expired token!');
    }
}