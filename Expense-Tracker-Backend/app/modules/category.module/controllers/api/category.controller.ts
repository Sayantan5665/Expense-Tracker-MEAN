import { ICategory, IColor, ITokenUser } from "../../../../interfaces/index";
import { Request, Response } from "express";
import categoryRepo from "../../repositories/category.repositories";
import colorRepo from "../../../color.module/repositories/color.repositories";
import { Types } from "mongoose";

class categoryController {

    async createCategory(req: Request, res: Response): Promise<any> {
        try {
            const user: ITokenUser = req.user!;
            const body = req.body;
            
            const category: ICategory | null = (await categoryRepo.getCategoryBy([{ userId: new Types.ObjectId(user.id) }, { name: body.name }], [{ isDefault: true }, { name: body.name }]))[0];
            if (category) {
                return res.status(409).json({
                    status: 409,
                    message: "Category already exists!",
                });
            }

            const color: IColor | null = await colorRepo.getColorBy({ _id: new Types.ObjectId(body.colorId) });
            if (!color) {
                return res.status(404).json({
                    status: 404,
                    message: "Color not found!",
                });
            }
            body.userId = user.id;

            if (user.role.role == 'user') {
                body?.isDefault && (body.isDefault = false);
            }

            const newCategory: ICategory = await categoryRepo.addCategory(body);

            return res.status(200).json({
                status: 200,
                message: `Category created successfully`,
                data: newCategory,
            });
        } catch (error: any) {
            console.error("error: ", error);
            return res.status(500).json({
                status: 500,
                message: error.message || "Something went wrong! Please try again.",
                error: error,
            });
        }
    }

    async getAllCategories(req: Request, res: Response): Promise<any> {
        try {
            const user: ITokenUser = req.user!;

            const categories: Array<ICategory | null> = await categoryRepo.getCategoryBy([{ userId: new Types.ObjectId(user.id) }], [{ isDefault: true }]);
            if (!categories.length) {
                return res.status(404).json({
                    status: 404,
                    message: "No categories found!",
                });
            }

            return res.status(200).json({
                status: 200,
                message: "Categorys fetched successfully!",
                data: categories
            });
        } catch (error: any) {
            console.log("error: ", error);
            return res.status(500).json({
                status: 500,
                message: error.message || "Something went wrong! Please try again.",
                error: error,
            })
        }
    }

    async getCategoryById(req: Request, res: Response): Promise<any> {
        try {
            const user: ITokenUser = req.user!;
            const categoryId: string = req.params.id || "";
            const category: ICategory | null = (await categoryRepo.getCategoryBy([{ userId: new Types.ObjectId(user.id) }, { _id: new Types.ObjectId(categoryId) }], [{ isDefault: true }, { _id: new Types.ObjectId(categoryId) }]))[0];

            if (!category) {
                return res.status(404).json({
                    status: 404,
                    message: "Category not found!",
                });
            }

            return res.status(200).json({
                status: 200,
                message: "Category fetched successfully!",
                data: category
            });
        } catch (error: any) {
            console.log("error: ", error);
            return res.status(500).json({
                status: 500,
                message: error.message || "Something went wrong! Please try again.",
                error: error,
            })
        }
    }

    async deleteCategory(req: Request, res: Response): Promise<any> {
        try {
            const user: ITokenUser = req.user!;
            const categoryId: string = req.params.id || "";
            const deletedCat = await categoryRepo.deleteCategory({ _id: new Types.ObjectId(categoryId), userId: new Types.ObjectId(user.id) });
            if (!deletedCat) {
                return res.status(404).json({
                    status: 404,
                    message: "Category not found!",
                });
            }

            return res.status(200).json({
                status: 200,
                message: "Category deleted successfully!",
            });
        } catch (error: any) {
            console.log("error: ", error);
            return res.status(500).json({
                status: 500,
                message: error.message || "Something went wrong! Please try again.",
                error: error,
            })
        }
    }

}

export default new categoryController();