import { ICategory } from "../../../interfaces/index";
import { categoryModel, categoryValidator } from "../models/category.model";
import { Types } from "mongoose";

type QueryCondition = { [key: string]: any };

class categoryRepository {
    async addCategory(body: ICategory): Promise<ICategory> {
        try {
            const { error } = categoryValidator.validate(body);
            if (error) throw error;

            const data = new categoryModel(body);
            const newCategory: ICategory = await data.save();
            return newCategory;
        } catch (error) {
            throw error;
        }
    }


    async getCategoryBy(firstCondition: [{ userId: Types.ObjectId }, ...QueryCondition[]], secondCondition: [{ isDefault: boolean }, ...QueryCondition[]], searchText: string = ""): Promise<Array<ICategory | null>> {
        try {
            const category: Array<ICategory | null> = await categoryModel.aggregate([
                {
                    $match: {
                        $or: [
                            { $and: firstCondition },
                            { $and: secondCondition }
                        ],
                        name: { $regex: searchText, $options: "i" }
                    }
                },
                {
                    $lookup: {
                        from: "colors",
                        localField: "colorId",
                        foreignField: "_id",
                        as: "color",
                    },
                },
                {
                    $unwind: "$color",
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                {
                    $unwind: "$user",
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        color: {
                            _id: "$color._id",
                            name: "$color.name",
                            hexCode: "$color.hexCode",
                        },
                        user: {
                            _id: "$user._id",
                            name: "$user.name",
                            email: "$user.email",
                        },
                        isDefault: 1,
                        description: 1,
                    },
                },
            ]);
            return category;
        } catch (error) {
            throw error;
        }
    }

    async deleteCategory(obj: { _id: Types.ObjectId, userId: Types.ObjectId, isDefault?: boolean }): Promise<ICategory | null> {
        try {
            const category: ICategory | null = await categoryModel.findOneAndDelete(obj);
            return category;
        } catch (error) {
            throw error;
        }
    }

    async updateCategory(categoryId: Types.ObjectId, body: ICategory): Promise<ICategory | null> {
        try {
            const category: ICategory | null = await categoryModel.findOneAndUpdate(
                {
                    _id: categoryId,
                },
                body,
                { new: true }
            );
            return category;
        } catch (error) {
            throw error;
        }
    }
}

export default new categoryRepository();