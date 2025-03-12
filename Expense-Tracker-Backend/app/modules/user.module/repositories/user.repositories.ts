import { Request } from "express";
import { comparePassword, deleteUploadedImage, generateToken, hashPassword, sendEmail, verifyToken } from "../../../utils/index";
import { IUser, IMailOptions, IVerificationToken, IRole } from "../../../interfaces/index";
import { userModel, userValidator } from "../models/user.model";
import { unlink } from "fs";
import path from "path";
import { Types } from "mongoose";
import roleRepositories from "../../role.module/repositories/role.repositories";

class userRepo {
    async findOneBy(keyValue: any): Promise<IUser | null> {
        try {
            const user: Array<IUser> = await userModel.aggregate([
                { $match: keyValue },
                {
                    $lookup: {
                        from: "roles",
                        localField: "role",
                        foreignField: "_id",
                        as: "roleDetails"
                    }
                },
                {
                    $unwind: "$roleDetails"
                },
                {
                    $project: {
                        _id: 1,
                        image: 1,
                        name: 1,
                        email: 1,
                        password: 1,
                        // role: "$roleDetails",
                        role: {
                            $cond: {
                                if: { $ne: ["$roleDetails", null] }, // Check if roleDetails exists
                                then: {
                                    role: "$roleDetails.role",
                                    roleDisplayName: "$roleDetails.roleDisplayName",
                                    rolegroup: "$roleDetails.rolegroup",
                                    description: "$roleDetails.description"
                                },
                                else: null
                            }
                        },
                        isVarified: 1,
                        isActive: 1,
                        timeZone: 1,
                        createdAt: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        // updatedAt: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }
                    }
                }
            ]);
            return user.length > 0 ? user[0] : null;
        } catch (error: any) {
            throw new Error(error.message || 'Something went wrong while finding user!');
        }
    }

    fetchAllUsers(matchConditions:any = {}): Promise<Array<IUser>> {
        return userModel.aggregate([
            {
                $match: matchConditions
            },
            {
                $lookup: {
                    from: "roles",
                    localField: "role",
                    foreignField: "_id",
                    as: "roleDetails"
                }
            },
            {
                $unwind: "$roleDetails"
            },
            {
                $project: {
                    _id: 1,
                    image: 1,
                    name: 1,
                    email: 1,
                    password: 1,
                    role: "$roleDetails.roleDisplayName",
                    isVarified: 1,
                    isActive: 1,
                    timeZone: 1,
                    createdAt: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                }
            }
        ]);
    }

    async addUser(req: Request, body: any): Promise<IUser> {
        try {
            const existUser: IUser | null = await this.findOneBy({ email: body.email });
            if (existUser) {
                throw new Error("Email already exists!");
            }

            if (body.password !== body.confirmPassword) {
                throw new Error("Passwords do not match!");
            }

            const hashedPassword: string = await hashPassword(body.password);
            body.password = hashedPassword;
            delete body.confirmPassword;
            if (body?.role && body.role?.length) {
                if (body.role === 'admin') {
                    throw new Error("Cannot rergister as admin!");
                } else {
                    const role: IRole | null = await roleRepositories.getRoleByRole(body.role);
                    if (!role) {
                        throw new Error("Role not found!");
                    } else {
                        body['role'] = (role._id as any).toString();
                    }
                }
            } else {
                const userRole: IRole | null = await roleRepositories.getRoleByRole('user');
                if (!userRole) {
                    throw new Error("User role not found!");
                } else {
                    body['role'] = (userRole._id as any).toString();
                }
            }

            const file: any = req.file || (req?.files as any || [])[0];
            const basePath: string = `${req.protocol}://${req.get('host')}`;
            let imagePath: string = `${basePath}/uploads/blank-profile-pic.jpg`;
            if (file) {
                imagePath = `${basePath}/uploads/${file.filename}`;
            }
            body.image = imagePath;

            const { error } = userValidator.validate(body);
            if (error) {
                throw error;
            }

            const verificationToken: string = await generateToken({ email: body.email });

            let verification_mail: string = `http://${req.headers.host}/api/user/account/confirmation/${verificationToken}`;
            const mailOptions: IMailOptions = {
                from: 'no-reply@sayantan.com',
                to: body.email,
                subject: 'Account Verification',
                html: `
                <h1>Hello, ${body.name}</h1>
                <p>Please verify your account by clicking the link below:</p>
                <a href="${verification_mail}" style="color: blue;">${verification_mail}</a>
                <br>
                <p>Thank you!</p>
            `
            };

            await sendEmail(mailOptions);

            const data = new userModel(body);
            const newUser: IUser = await data.save();
            return newUser;
        } catch (error) {
            const file: any = req.file || (req?.files as any || [])[0];
            file && deleteUploadedImage(file.filename, 'blank-profile-pic.jpg');
            throw error
        }
    }

    async emailVerify(token: string) {
        try {
            const tokenData: IVerificationToken | null = await verifyToken(token);
            if (!tokenData) {
                throw new Error("Invalid verification token!")
            }

            const user: IUser | null = await this.findOneBy({ email: tokenData.email });

            if (!user) {
                throw new Error("Invalid verification token!")
            }

            await userModel.findByIdAndUpdate(user._id, { isVarified: true, isActive: true });
        } catch (error) {
            throw error;
        }
    }
    async login(body: any): Promise<any> {
        try {
            const { email, password } = body;
            const user: IUser | null = await this.findOneBy({ email: email, isActive: true });

            if (!user || !user.isVarified || !(await comparePassword(password, user.password))) {
                throw new Error(!user ? "User not found!" :
                    (!user.isVarified ? "Your account is not verified. Please check your email for the verification link." :
                        "Invalid email or password!"))
            }

            const token: string = await generateToken({
                id: user._id?.toString(),
                name: user.name,
                image: user.image,
                email: user.email,
                role: user.role,
                timeZone: user.timeZone,
                createdAt: user.createdAt,
            });

            return { user, token }
        } catch (error) {
            throw error;
        }
    }

    async editUser(req: Request, userId: string, body: any): Promise<IUser | null> {
        try {
            const existingUser = await this.findOneBy({ _id: new Types.ObjectId(userId), isActive: true });

            if (!existingUser) {
                throw new Error("User not found!");
            }

            const file = req.file || (req?.files as any || [])[0];
            if (file) {
                const basePath: string = `${req.protocol}://${req.get('host')}`;
                const imagePath: string = `${basePath}/uploads/${file.filename}`;
                body.image = imagePath;

                const existingImageName: string | undefined = existingUser.image.split('/').pop();
                if (existingImageName && existingImageName !== 'blank-profile-pic.jpg') {
                    unlink(path.join(__dirname, '..', '..', '..', '..', 'uploads', existingImageName), (err) => {
                        if (err) console.error(`Error deleting image: ${err}`);
                        else {
                            console.log('Old images deleted successfully');
                        }
                    });
                }
            }

            body.role && delete body.role;

            const user: IUser | null = await userModel.findByIdAndUpdate(userId, body, { new: true }).select('-isActive -isVarified -updatedAt -password').populate('role', '-_id role roleDisplayName rolegroup description');
            return user;
        } catch (error) {
            const file: any = req.file || (req?.files as any || [])[0];
            file && deleteUploadedImage(file.filename, 'blank-profile-pic.jpg');
            throw error;
        }
    }

    async fetchProfile(id: string): Promise<IUser | null> {
        try {
            const userId = new Types.ObjectId(id);

            const user: Array<IUser> = await userModel.aggregate([
                {
                    $match: {
                        _id: userId, 
                        isActive: true
                    }
                },
                {
                    $lookup: {
                        from: "roles",
                        localField: "role",
                        foreignField: "_id",
                        as: "roleDetails"
                    }
                },
                {
                    $unwind: "$roleDetails"
                },
                {
                    $project: {
                        _id: 1,
                        image: 1,
                        name: 1,
                        email: 1,
                        role: "$roleDetails.roleDisplayName",
                        timeZone: 1,
                        createdAt: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                    }
                }
            ]);
            return user.length > 0 ? user[0] : null;
        } catch (error: any) {
            throw new Error(error.message || 'Something went wrong while finding user!');
        }
    }

    async forgotPassword(req: Request, body: { email: string, password: string }): Promise<void> {
        try {
            const verificationToken: string = await generateToken(body);

            let forgotPasswordMail: string = `http://${req.headers.host}/api/user/confirm/forgot-password/${verificationToken}`;
            const mailOptions: IMailOptions = {
                from: 'no-reply@sayantan.com',
                to: body.email,
                subject: 'Account Verification',
                html: `
                <h1>Hello,</h1>
                <p>We have recieved a change password request. Please click the link below to confirm that it's You.</p>
                <a href="${forgotPasswordMail}" style="color: blue;">${forgotPasswordMail}</a>
                <br>
                <p>This link will expire in 24 hours. If you didn't request a password change, please ignore this email.</p>
                <br>
                <p>Thank you!</p>
            `};

            await sendEmail(mailOptions);
        } catch (error: any) {
            console.log("error: ", error);
            throw new Error(error.message || 'Something went wrong!');
        }
    }
    async confirmPasswordChange(token: string): Promise<IUser | null> {
        try {
            const tokenData: IVerificationToken | null = await verifyToken(token);
            if (!tokenData) {
                throw new Error("Invalid verification token!");
            }
            if (!tokenData.password) {
                throw new Error("Password is required!");
            }
            const user: IUser | null = await userModel.findOneAndUpdate({ email: tokenData.email, isActive: true }, { password: await hashPassword(tokenData.password) }, { new: true }).select('-isActive -isVarified -updated_at -password');
            return user;
        } catch (error: any) {
            console.log("error: ", error);
            throw new Error(error.message || 'Something went wrong while resetting password!');
        }
    }

    async deteteUser(userId: string): Promise<IUser | null> {
        try {
            const user: IUser | null = await userModel.findOneAndUpdate({ _id: userId, isActive: true }, { isActive: false }, { new: true }).select('-isActive -isVarified -updated_at -password').populate('role');
            return user;
        } catch (error: any) {
            throw new Error(error.message || 'Something went wrong while fetching all users!');
        }
    }

    /*** For admin panel only */
    async activeDeactiveUser(userId: string, changedStatus:boolean): Promise<IUser | null> {
        try {
            const user: IUser | null = await userModel.findOneAndUpdate({ _id: userId }, { isActive: changedStatus  }, { new: true }).select('-isActive -isVarified -updated_at -password').populate('role');
            return user;
        } catch (error: any) {
            throw new Error(error.message || 'Something went wrong while fetching all users!');
        }
    }
}

export default new userRepo();