import { IColor } from "@interfaces";
import { colorModel, colorValidator } from "../models/color.model";

class colorRepository {
    async addColor(body: IColor): Promise<IColor> {
        try {
            const { error } = colorValidator.validate(body);
            if (error) throw error;

            const data = new colorModel(body);
            const newColor: IColor = await data.save();
            return newColor;
        } catch (error) {
            throw error;
        }
    }

    async fetchAllColors(): Promise<Array<IColor>> {
        try {
            const colors: Array<IColor> = await colorModel.find();
            return colors;
        } catch (error) {
            throw error;
        }
    }


    async getColorBy(obj:any): Promise<IColor | null> {
        try {
            const color: IColor | null = await colorModel.findOne(obj);
            return color;
        } catch (error) {
            throw error;
        }
    }

    async deleteColor(id: string): Promise<IColor | null> {
        try {
            const color:IColor | null = await colorModel.findByIdAndDelete(id);
            return color;
        } catch (error) {
            throw error;
        }
    }
}

export default new colorRepository();