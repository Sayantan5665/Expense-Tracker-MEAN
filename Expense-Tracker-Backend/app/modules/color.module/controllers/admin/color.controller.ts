import { IColor } from "app/interfaces";
import colorRepo from "../../repositories/color.repositories";
import { Request, Response } from "express";
import { Types } from "mongoose";

class colorAdminController {
    async colorListPage(req: Request, res: Response): Promise<any> {
        try {
            const { colorName, hexCode } = req.query;
            const matchCond:any = {};
            if (colorName && colorName.length) matchCond['name'] = colorName;
            if (hexCode && hexCode.length) matchCond['hexCode'] = hexCode;
            const colors: IColor[] = await colorRepo.fetchAllColors(matchCond);

            res.render('pages/color/list', {
                title: 'Colour',
                data: {
                    url: req.url,
                    user: req.user,
                    totalColors: colors.length,
                    colorList: colors
                },
                messages: req.flash('message')
            });
        } catch (error: any) {
            console.log("error: ", error);
            req.flash('message', [{ msg: error.message || 'Something went wrong!', type: 'danger' }] as any);
            res.redirect('/error');
        }
    }

}

export default new colorAdminController();