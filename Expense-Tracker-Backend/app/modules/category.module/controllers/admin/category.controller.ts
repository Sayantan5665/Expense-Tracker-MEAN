import { ICategory, IColor, ITokenUser } from "../../../../interfaces";
import colorRepositories from "../../../color.module/repositories/color.repositories";
import categoryRepo from "../../repositories/category.repositories";
import { Request, Response } from "express";
import { Types } from "mongoose";


class categoryAdminController {
    async categoryListPage(req: Request, res: Response): Promise<any> {
        try {
            const user: ITokenUser = req.user!;
            const categories: Array<ICategory | null> = await categoryRepo.getCategoryBy([{ userId: new Types.ObjectId(user.id) }], [{ isDefault: true }], '');
            res.render('pages/category/list', {
                title: 'Category',
                data: {
                    url: req.url,
                    user: req.user,
                    totalCategories: categories.length,
                    categoryList: categories
                },
                messages: req.flash('message')
            });
        } catch (error: any) {
            console.log("error: ", error);
            req.flash('message', [{ msg: error.message || 'Something went wrong!', type: 'danger' }] as any);
            res.redirect('/error');
        }
    }

    async categoryCreatePage(req: Request, res: Response): Promise<any> {
        try {
            const colors: IColor[] = await colorRepositories.fetchAllColors('');

            res.render('pages/category/create', {
                title: 'Category',
                data: {
                    url: req.url,
                    user: req.user,
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
    async categoryEditPage(req: Request, res: Response): Promise<any> {
        try {
            const id = req.params.id || '';
            const user: ITokenUser = req.user!;
            const category: ICategory | null = (await categoryRepo.getCategoryBy([{ userId: new Types.ObjectId(user.id) }, { _id: new Types.ObjectId(id) }], [{ isDefault: true }, { _id: new Types.ObjectId(id) }]))[0];
            if (!category) {
                req.flash('message', [{ msg: 'Category not found!', type: 'danger' }] as any);
                return res.redirect('/expense/categories');
            }
            const colors: IColor[] = await colorRepositories.fetchAllColors('');
            res.render('pages/category/edit', {
                title: 'Category',
                data: {
                    url: req.url,
                    user: req.user,
                    colorList: colors,
                    category: category
                },
                messages: req.flash('message')
            });
        } catch (error: any) {
            console.log("error: ", error);
            req.flash('message', [{ msg: error.message || 'Something went wrong!', type: 'danger' }] as any);
            res.redirect('/error');
        }
    }







    async categoryAdd(req: Request, res: Response): Promise<any> {
        try {
            const user: ITokenUser = req.user!;
            const body = req.body;

            const category: ICategory | null = (await categoryRepo.getCategoryBy([{ userId: new Types.ObjectId(user.id) }, { name: body.name }], [{ isDefault: true }, { name: body.name }]))[0];
            if (category) {
                req.flash('message', [{ msg: 'Category already exists!', type: 'warning' }] as any);
                return res.redirect('/expense/category/add');
            }

            const color: IColor | null = await colorRepositories.getColorBy({ _id: new Types.ObjectId(body.colorId) });
            if (!color) {
                req.flash('message', [{ msg: 'Color not found!', type: 'danger' }] as any);
                return res.redirect('/expense/category/add');
            }
            body.userId = user.id;

            if (user.role.role == 'user') {
                body?.isDefault && (body.isDefault = false);
            }
            const newCategory: ICategory = await categoryRepo.addCategory(body);
            req.flash('message', [{ msg: 'Category added successfully!', type: 'success' }] as any);
            return res.redirect('/expense/categories');
        } catch (error: any) {
            console.log("error: ", error);
            req.flash('message', [{ msg: error.message || 'Something went wrong!', type: 'danger' }] as any);
            res.redirect('/expense/category/add');
        }
    }

    async editCcategory(req: Request, res: Response): Promise<any> {
        try {
            const body = req.body;
            const id = req.params.id || '';
            const user: ITokenUser = req.user!;
            const category: any = (await categoryRepo.getCategoryBy([{ userId: new Types.ObjectId(user.id) }, { _id: new Types.ObjectId(id) }], [{ isDefault: true }, { _id: new Types.ObjectId(id) }]))[0];
            if (!category) {
                console.log("Category not found - 1");
                req.flash('message', [{ msg: 'Category not found!', type: 'danger' }] as any);
                return res.redirect('/expense/categories');
            }

            if (category?.user?._id.toString() !== user?.id?.toString()) {
                req.flash('message', [{ msg: 'You are not authorized to edit this category.', type: 'danger' }, { msg: 'Only creator of a category can edit it.', type: 'danger' }] as any);
                return res.redirect('/expense/categories');
            }

            if (body.colorId) {
                const color: IColor | null = await colorRepositories.getColorBy({ _id: new Types.ObjectId(body.colorId) });
                if (!color) {
                    req.flash('message', [{ msg: 'Color not found!', type: 'danger' }] as any);
                    return res.redirect('/expense/category/edit');
                }
            }

            if (user.role.role == 'user') {
                body?.isDefault && (body.isDefault = false);
            }
            const newCategory: ICategory | null = await categoryRepo.updateCategory(new Types.ObjectId(id), body);
            if (!newCategory) {
                console.log("Category not found - 2");

                req.flash('message', [{ msg: 'Category not found!', type: 'danger' }] as any);
                return res.redirect('/expense/categories');
            }
            req.flash('message', [{ msg: 'Category updated successfully!', type: 'success' }] as any);
            return res.redirect('/expense/categories');
        } catch (error: any) {
            console.log("error: ", error);
            req.flash('message', [{ msg: error.message || 'Something went wrong!', type: 'danger' }] as any);
            return res.redirect('/expense/categories');
        }
    }

    async deleteCategory(req: Request, res: Response): Promise<any> {
        try {
            const user: ITokenUser = req.user!;
            const categoryId: string = req.params.id || "";
            const deletedCat = await categoryRepo.deleteCategory({ _id: new Types.ObjectId(categoryId), userId: new Types.ObjectId(user.id) });
            if (!deletedCat) {
                req.flash('message', [{ msg: 'Color not found!', type: 'danger' }] as any);
                return res.redirect('/expense/categories');
            }

            req.flash('message', [{ msg: 'Category deleted successfully!', type: 'success' }] as any);
            return res.redirect('/expense/categories');
        } catch (error: any) {
            console.log("error: ", error);
            req.flash('message', [{ msg: error.message || 'Something went wrong!', type: 'danger' }] as any);
            return res.redirect('/expense/categories');
        }
    }
}

export default new categoryAdminController();