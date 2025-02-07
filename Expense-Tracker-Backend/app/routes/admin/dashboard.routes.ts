import { Request, Response, Router } from "express";

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.render('dashboard', {
        title: 'Dashboard',
        data: {
            url: req.url,
            user: req.user
        },
        messages: req.flash('message')
    });
})

export default router;