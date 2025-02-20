import { Request, Response, Router } from "express";
import { authAdminPanel } from "../../middlewares";

const router = Router();

router.get('/', authAdminPanel, (req: Request, res: Response) => {
    try {
        res.render('pages/dashboard', {
            title: 'Dashboard',
            data: {
                url: req.url,
                user: req.user
            },
            messages: req.flash('message')
        });
    } catch (error:any) {
        console.log("error: ", error);
        req.flash('message', [{ msg: error.message || 'Something went wrong!', type: 'danger' }] as any);
        res.redirect('/')
    }
})

export default router;