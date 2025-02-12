import { Request, Response } from "express";

class aboutController {
    async aboutCmsPage(req:Request, res: Response):Promise<any> {
        try {
            res.render('pages/about', {
                title: 'About',
                data: {
                    url: req.url,
                    user: req.user
                },
                messages: req.flash('message')
            });
        } catch (error:any) {
            console.log("error: ", error);
            req.flash('message', [{ msg: error.message || "Something went wrong!", type: 'danger' }] as any);
            return res.redirect('/');
        }
    }
}

export default new aboutController();