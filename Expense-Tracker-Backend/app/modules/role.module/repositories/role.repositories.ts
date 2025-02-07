import { IRole } from "../../../interfaces/index";
import { roleModel, roleValidator } from "../models/role.model";

class roleRepo {
    async addRole(body: IRole): Promise<IRole> {
        try {
            const { error } = roleValidator.validate(body);
            if (error) throw error;

            const data = new roleModel(body);
            const newRole: IRole = await data.save();
            return newRole;
        } catch (error) {
            throw error;
        }
    }

    async fetchRoles(): Promise<Array<IRole>> {
        try {
            const roles:Array<IRole> = await roleModel.find();
            return roles;
        } catch (error) {
            throw error;
        }
    }


    async getRoleById(id: string): Promise<IRole | null> {
        try {
            const role: IRole | null = await roleModel.findById(id);
            return role;
        } catch (error) {
            throw error;
        }
    }

    async getRoleByRole(_role: string): Promise<IRole | null> {
        try {
            const role: IRole | null = await roleModel.findOne({ role: _role });
            return role;
        } catch (error) {
            throw error;
        }
    }

    async deleteRole(id:string): Promise<IRole> {
        try {
            const role: IRole | null = await roleModel.findById(id);
            if (!role) throw new Error("Role not found");

            await roleModel.findByIdAndDelete(id);
            return role;
        } catch (error) {
            throw error;
        }
    }
}

export default new roleRepo();