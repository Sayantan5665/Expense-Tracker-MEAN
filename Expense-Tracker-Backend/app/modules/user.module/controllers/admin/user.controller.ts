import userRepo from "../../repositories/user.repositories";
import { Request, Response } from "express";
import { Types } from "mongoose";
import { IUser } from "../../../../interfaces";
import { generateToken } from "../../../../utils";
import { agenda } from "../../../../configs";

class UserAdminController {
    async loginPage(req: Request, res: Response): Promise<any> {
        try {
            res.render('auth/login', {
                title: 'Login',
                data: {
                    url: req.url,
                    user: {}
                },
                messages: req.flash('message')
            });
        } catch (error: any) {
            console.log("error: ", error);
            req.flash('message', [{ msg: error.message || 'Something went wrong!', type: 'danger' }] as any);
            res.redirect('/error');
        }
    }

    // async registrationPage(req: Request, res: Response): Promise<any> {
    //     try {
    //         res.render('auth/register', {
    //             title: 'Register',
    //             data: {
    //                 url: req.url,
    //                 user: {}
    //             },
    //             messages: req.flash('message')
    //         });
    //     } catch (error: any) {
    //         console.log("error: ", error);
    //         req.flash('message', [{ msg: error.message || 'Something went wrong!', type: 'danger' }] as any);
    //         res.redirect('/error');
    //     }
    // }

    async forgotPasswordPage(req: Request, res: Response): Promise<any> {
        try {
            res.render('auth/forgot-password', {
                title: 'Forgot Password',
                data: {
                    url: req.url,
                    user: {}
                },
                messages: req.flash('message')
            });
        } catch (error: any) {
            console.log("error: ", error);
            res.redirect('/error');
        }
    }

    async profilePage(req: Request, res: Response): Promise<any> {
        try {
            res.render('pages/profile', {
                title: 'Profile',
                data: {
                    url: req.url,
                    user: req.user
                },
                messages: req.flash('message')
            });
        } catch (error: any) {
            console.log("error: ", error);
            req.flash('message', [{ msg: error.message || 'Something went wrong!', type: 'danger' }] as any);
            res.redirect('/error');
        }
    }

    async usrListPage(req: Request, res: Response): Promise<any> {
        try {
            const users: Array<IUser> = await userRepo.fetchAllUsers();
            // req.flash('message', [{ msg: "Users fetched successfully", type: 'success' }] as any);
            res.render('pages/users-list', {
                title: 'Users List',
                data: {
                    url: req.url,
                    user: req.user,
                    totalUsers: users.length,
                    usersList: users
                },
                messages: req.flash('message')
            })
        } catch (error: any) {
            console.log("error: ", error);
            req.flash('message', [{ msg: error.message || "Something went wrong! Please try again.", type: 'danger' }] as any);
            return res.redirect('/login');
        }
    }







    async login(req: Request, res: Response): Promise<any> {
        try {
            const { user, token } = await userRepo.login(req.body);

            if (user.role.role !== 'admin') {
                throw new Error("Only admin can login here!")
            }

            res.cookie('x-access-token', token, {
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });

            req.flash('message', [{ msg: `Welcome back ${user.name}`, type: 'success' }] as any);
            res.redirect('/');
        } catch (error: any) {
            console.error("Login error:", error);
            req.flash('message', [{ msg: error?.message || "An unexpected error occurred. Please try again later.", type: 'danger' }] as any);
            res.redirect('/login');
        }
    }

    async logout(req: Request, res: Response): Promise<any> {
        req.user = undefined;
        // res.cookie('x-access-token', '', { // set to an expired date to remove the cookie
        //     expires: new Date(0),
        // });
        res.clearCookie('x-access-token');
        req.flash('message', [{ msg: 'You have been logged out successfully.', type: 'success' }] as any);
        res.redirect('/login');
    }


    async updateUserProfile(req: Request, res: Response): Promise<any> {
        try {
            const userId: string = req.params.id;
            const body = req.body;
            body.password && delete body.password;
            body.role && delete body.role;
            body.isVarified && delete body.isVarified;
            body.isActive && delete body.isActive;

            const user: IUser | null = await userRepo.editUser(req, userId, body);
            if (!user) {
                req.flash('message', [{ msg: "User not found!", type: 'danger' }] as any);
                return res.redirect('/');
            }

            const _user = {
                id: user._id.toString(),
                name: user.name,
                image: user.image,
                email: user.email,
                role: user.role,
                timeZone: user.timeZone,
                createdAt: user.createdAt,
            };
            req.user = _user;
            /* need to do it because token has previous data and in admin panel we are showing 
            user data from req.user, which is getting data from token */
            res.cookie('x-access-token', await generateToken(_user), {
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });

            req.flash('message', [{ msg: "Profile updated successfully", type: 'success' }] as any);
            return res.redirect('/profile');
        } catch (error: any) {
            console.log("error: ", error);
            req.flash('message', [{ msg: error.message || "Something went wrong! Please try again.", type: 'danger' }] as any);
            return res.redirect('/');
        }
    }

    async fetchAllActiveUsers(req: Request, res: Response): Promise<any> {
        try {
            const users: Array<IUser> = await userRepo.fetchAllUsers({ isActive: true });

            req.flash('message', [{ msg: "Users fetched successfully", type: 'success' }] as any);
            return res.redirect('/login');
        } catch (error: any) {
            console.log("error: ", error);
            req.flash('message', [{ msg: error.message || "Something went wrong! Please try again.", type: 'danger' }] as any);
            return res.redirect('/login');
        }
    }

    async forgotPassword(req: Request, res: Response): Promise<any> {
        try {
            const { email, password, confirmPassword } = req.body;
            if (!email || !password || !confirmPassword) {
                req.flash('message', [{ msg: "Please provide all required fields!", type: 'warning' }] as any);
                return res.redirect('/forgot-password');
            }
            if (password !== confirmPassword) {
                req.flash('message', [{ msg: "Passwords do not match!", type: 'danger' }] as any);
                return res.redirect('/forgot-password');
            }
            await userRepo.forgotPassword(req, { email, password });
            req.flash('message', [{ msg: "An email sent to your email address. Please click on it to confir passowd change.", type: 'success' }] as any);
            return res.redirect('/login');
        } catch (error: any) {
            console.error("error: ", error);
            req.flash('message', [{ msg: error.message || "Something went wrong! Please try again.", type: 'danger' }] as any);
            return res.redirect('/forgot-password');
        }
    }
    async confirmPasswordChange(req: Request, res: Response): Promise<any> {
        try {
            const token = req.params.token;
            if (!token) {
                req.flash('message', [{ msg: "Token is not provided!", type: 'danger' }] as any);
                return res.redirect('/login');
            }
            const user = await userRepo.confirmPasswordChange(token);
            if (!user) {
                req.flash('message', [{ msg: "Invalid token! Please request a new password reset link.", type: 'danger' }] as any);
                return res.redirect('/login');
            }
            req.flash('message', [{ msg: "Password changed successfully! Please login with your new password.", type: 'success' }] as any);
            return res.redirect('/login');
        } catch (error: any) {
            console.error("error: ", error);
            req.flash('message', [{ msg: error.message || "Something went wrong! Please try again.", type: 'danger' }] as any);
            return res.redirect('/login');
        }
    }

    async activeDeactiveUser(req: Request, res: Response): Promise<any> {
        try {
            const userId: string = req.params.userId;

            const user: IUser | null = await userRepo.findOneBy({ _id: new Types.ObjectId(userId) });
            if (!user) {
                req.flash('message', [{ msg: "User not found!", type: 'danger' }] as any);
                return res.redirect('/users-list');
            }

            const userWithChangedStatus: IUser | null = await userRepo.activeDeactiveUser(userId, !user.isActive);
            if (!userWithChangedStatus) {
                req.flash('message', [{ msg: "Failed to update user status!", type: 'danger' }] as any);
                return res.redirect('/users-list');
            }

            if (!user.isActive) {
                // Reschedule reports for re-activated user
                await agenda.every('0 20 * * *', 'sendDailyReport', { userId: user._id });
                await agenda.every('0 9 1 * *', 'sendMonthlyReport', { userId: user._id });
            } else {
                // Cancel all scheduled reports for this user
                await agenda.cancel({
                    'data.userId': user._id.toString(),
                    name: { $in: ['sendDailyReport', 'sendMonthlyReport'] }
                });
            }

            req.flash('message', [{ msg: `Account ${!user.isActive ? 'activated' : 'deactivated'} successfully!`, type: 'success' }] as any);
            return res.redirect('/users-list');
        } catch (error: any) {
            console.error("error: ", error);
            req.flash('message', [{ msg: error.message || "Something went wrong! Please try again.", type: 'danger' }] as any);
            return res.redirect('/');
        }
    }


}

export default new UserAdminController();