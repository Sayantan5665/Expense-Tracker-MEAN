import { IUser } from "app/interfaces";
import userRepo from "../../repositories/user.repositories";
import { Request, Response } from "express";

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

    async forgotPasswordPage(req: Request, res: Response): Promise<any> { }


    async login(req: Request, res: Response): Promise<any> {
        try {
            const { user, token } = await userRepo.login(req.body);

            if(user.role.role !== 'admin') {
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
        // res.cookie('x-access-token', '', { // set to an expired date to remove the cookie
        //     expires: new Date(0),
        // });
        res.clearCookie('x-access-token');
        req.flash('message', [{ msg: 'You have been logged out successfully.', type: 'success' }] as any);
        res.redirect('/login');
    }
}

export default new UserAdminController();