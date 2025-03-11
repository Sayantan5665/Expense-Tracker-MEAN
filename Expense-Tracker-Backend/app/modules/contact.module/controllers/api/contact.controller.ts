import { IContact } from "../../../../interfaces/index";
import { Request, Response } from "express";
import contactRepo from "../../repositories/contact.repositories";

class contactController {

    async createContact(req: Request, res: Response): Promise<any> {
        try {
            const body: IContact = req.body;
            console.log("body: ", body);

            const newContact: IContact = await contactRepo.addContact(body);
            console.log("newContact: ", newContact);

            return res.status(200).json({
                status: 200,
                message: `We have got your message. We will reach you soon.`,
                data: newContact,
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

}

export default new contactController();