import colorRepo from "../../repositories/color.repositories";
import { Request, Response } from "express";
import { Types } from "mongoose";
import { IColor } from "../../../../interfaces";
import { isValidHexColor } from "../../../../utils";


class colorAdminController {
    async colorListPage(req: Request, res: Response): Promise<any> {
        try {
            const colors: IColor[] = await colorRepo.fetchAllColors('');

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

    async colorCreatePage(req: Request, res: Response): Promise<any> {
        try {
            res.render('pages/color/create', {
                title: 'Colour',
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

    async colorCreate(req: Request, res: Response): Promise<any> {
        try {
            const body: IColor = req.body;

            const colorWithName: IColor | null = await colorRepo.getColorBy({ name: body.name });
            const colorWithhexCode: IColor | null = await colorRepo.getColorBy({ hexCode: body.hexCode });
            if (colorWithName) {
                req.flash('message', [{ msg: `Color with name '${body.name}' already exists`, type: 'warning' }] as any);
                return res.redirect('/expense/color/add');
            }
            if (colorWithhexCode) {
                req.flash('message', [{ msg: `Color with hex code '${body.hexCode}' already exists`, type: 'warning' }] as any);
                return res.redirect('/expense/color/add');
            }

            if (!isValidHexColor(body.hexCode)) {
                req.flash('message', [{ msg: `Invalid hex color code`, type: 'warning' }] as any);
                return res.redirect('/expense/color/add');
            }

            const newColor: IColor = await colorRepo.addColor(body);
            console.log("newColor: ", newColor);

            req.flash('message', [{ msg: 'Color created successfully!', type: 'success' }] as any);
            return res.redirect('/expense/colors');
        } catch (error: any) {
            console.log("error: ", error);
            req.flash('message', [{ msg: error.message || 'Something went wrong!', type: 'danger' }] as any);
            return res.redirect('/expense/color/add');
        }
    }

    /*** Admin only */
    async deleteColor(req: Request, res: Response): Promise<any> {
        try {
            const ColorId: string = req.params.id || "";
            const deletedColor = await colorRepo.deleteColor(ColorId);
            if (!deletedColor) {
                req.flash('message', [{ msg: 'Color not found!', type: 'warning' }] as any);
                return res.redirect('/expense/color/add');
            }

            req.flash('message', [{ msg: 'Colour deleted successfully!', type: 'success' }] as any);
            return res.redirect('/expense/colors');
        } catch (error: any) {
            console.log("error: ", error);
            req.flash('message', [{ msg: error.message || 'Something went wrong!', type: 'danger' }] as any);
            return res.redirect('/expense/color/add');
        }
    }
}

export default new colorAdminController();