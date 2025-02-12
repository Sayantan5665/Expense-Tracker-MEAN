import { Request, Response } from "express";

class contactController {
    async contactCmsPage(req:Request, res: Response):Promise<any> {
        try {
            res.render('pages/contact-us', {
                title: 'Contact Us',
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

export default new contactController();