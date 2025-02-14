import { IColor } from "../../../../interfaces/index";
import { Request, Response } from "express";
import colorRepo from "../../repositories/color.repositories";
import { isValidHexColor } from "../../../../utils/index";

class colorController {
    /*** Admin only */
    async createColor(req: Request, res: Response): Promise<any> {
        try {
            const body: IColor = req.body;

            const colorWithName: IColor | null = await colorRepo.getColorBy({ name: body.name });
            const colorWithhexCode: IColor | null = await colorRepo.getColorBy({ hexCode: body.hexCode });
            if (colorWithName) {
                return res.status(400).json({
                    status: 400,
                    message: `Color with name '${body.name}' already exists`,
                });
            }
            if (colorWithhexCode) {

                return res.status(400).json({
                    status: 400,
                    message: `Color with hex code '${body.hexCode}' already exists`,
                });
            }

            if (!isValidHexColor(body.hexCode)) {
                throw new Error("Invalid hex color code");
            }

            const newColor: IColor = await colorRepo.addColor(body);

            return res.status(200).json({
                status: 200,
                message: `'${newColor.name}' added successfully`,
                data: newColor,
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

    async getAllColors(req: Request, res: Response): Promise<any> {
        try {
            const search: any = req.query.search || '';
            const colors: IColor[] = await colorRepo.fetchAllColors(search?.length ? search : '');

            return res.status(200).json({
                status: 200,
                message: "Colours fetched successfully!",
                data: colors
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

    async getColorByName(req: Request, res: Response): Promise<any> {
        try {
            const colorName: string = req.params.name || "";
            const color: IColor | null = await colorRepo.getColorBy({ name: colorName });

            if (!color) {
                return res.status(404).json({
                    status: 404,
                    message: "Colour not found!",
                });
            }

            return res.status(200).json({
                status: 200,
                message: "Colour fetched successfully!",
                data: color
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

    async getColorById(req: Request, res: Response): Promise<any> {
        try {
            const colorId: string = req.params.id || "";
            const color: IColor | null = await colorRepo.getColorBy({ _id: colorId });

            if (!color) {
                return res.status(404).json({
                    status: 404,
                    message: "Colour not found!",
                });
            }

            return res.status(200).json({
                status: 200,
                message: "Colour fetched successfully!",
                data: color
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

    /*** Admin only */
    async deleteColor(req: Request, res: Response): Promise<any> {
        try {
            const ColorId: string = req.params.id || "";
            const deletedColor = await colorRepo.deleteColor(ColorId);
            if (!deletedColor) {
                return res.status(404).json({
                    status: 404,
                    message: "Colour not found!",
                });
            }

            return res.status(200).json({
                status: 200,
                message: "Colour deleted successfully!",
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

export default new colorController();