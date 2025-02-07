import { IRole } from "../../../../interfaces/index";
import { Request, Response } from "express";
import roleRepo from "../../repositories/role.repositories";

class roleController {

    async createRole(req: Request, res: Response): Promise<any> {
        try {
            // const token = req.cookies['x-access-token'] || req.headers['x-access-token'];
            const body: IRole = req.body;

            const newRole: IRole = await roleRepo.addRole(req.body);

            return res.status(200).json({
                status: 200,
                message: `'${newRole.roleDisplayName}' role created successfully`,
                data: newRole,
            });
        } catch (error: any) {
            console.error("error registering: ", error);
            return res.status(500).json({
                status: 500,
                message: error.message || "Something went wrong! Please try again.",
                error: error,
            });
        }
    }

    async getRoles(req: Request, res: Response): Promise<any> {
        try {
            const roles: IRole[] = await roleRepo.fetchRoles();

            if (!roles.length) {
                return res.status(404).json({
                    status: 404,
                    message: "No roles found!",
                });
            }

            return res.status(200).json({
                status: 200,
                message: "Roles fetched successfully!",
                data: roles
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

    async deleteRole(req: Request, res: Response): Promise<any> {
        try {
            const roleId: string = req.params.id || "";
            await roleRepo.deleteRole(roleId);;

            return res.status(200).json({
                status: 200,
                message: "Role deleted successfully!",
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

export default new roleController();