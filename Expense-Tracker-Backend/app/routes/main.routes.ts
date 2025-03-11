import { Request, Response, Router } from "express";
const router = Router();

/* +++++ api's imports +++++ */
import userRouter from "./api/user.routes";
import roleRouter from "./api/role.routes";
import colorRouter from "./api/color.routes";
import categoryRouter from "./api/category.routes";
import expenseRouter from "./api/expense.routes";
import contactRouter from "./api/contacts.routes";

/* +++++ admin panel's imports +++++ */
import dashboardRouter from "./admin/dashboard.routes";
import userAdminRouter from "./admin/user.routes";
import aboutAdminRouter from "./admin/about.routes";
import contactUsAdminRouter from "./admin/contact-us.routes";
import colorAdminRouter from "./admin/color.routes";
import categoryAdminRouter from "./admin/category.routes";
import contactAdminRouter from "./admin/contacts.routes";




/* +++++ for api +++++ */
router.use("/api/user", userRouter);
router.use("/api/user/role", roleRouter);
router.use("/api/color", colorRouter);
router.use("/api/category", categoryRouter);
router.use("/api/expense", expenseRouter);
router.use("/api/contact", contactRouter);




/* +++++ for admin panel +++++ */
router.use(dashboardRouter);
router.use(userAdminRouter);
router.use(aboutAdminRouter);
router.use(contactUsAdminRouter);
router.use(colorAdminRouter);
router.use(categoryAdminRouter);
router.use(contactAdminRouter);




router.use('/verified', async (req: Request, res: Response) => {
    try {
        res.render('shared/verified-page', {
            title: 'Verified',
            messages: req.flash('message')
        });
    } catch (error: any) {
        console.log("error: ", error);
        req.flash('message', [{ msg: error.message || 'Something went wrong!', type: 'danger' }] as any);
        res.redirect('/error');
    }
})
router.use('/error-500', async (req: Request, res: Response) => {
    try {
        res.render('shared/error-500', {
            title: '500',
            data: {
                url: req.url,
                user: req.user
            },
            messages: req.flash('message')
        });
    } catch (error: any) {
        console.log("error: ", error);
        req.flash('message', [{ msg: error.message || 'Something went wrong!', type: 'danger' }] as any);
        res.redirect('/');
    }
})
router.use('*', async (req: Request, res: Response) => {
    try {
        res.render('shared/error-404', {
            title: '404',
            data: {
                url: req.url,
                user: req.user
            },
            messages: req.flash('message')
        });
    } catch (error: any) {
        console.log("error: ", error);
        req.flash('message', [{ msg: error.message || 'Something went wrong!', type: 'danger' }] as any);
        res.redirect('/');
    }
})

export default router;