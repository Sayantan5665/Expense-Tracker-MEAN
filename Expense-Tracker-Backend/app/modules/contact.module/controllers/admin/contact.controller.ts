import { IContact } from "../../../../interfaces/index";
import { Request, Response } from "express";
import contactRepo from "../../repositories/contact.repositories";

class contactController {
    async contactsPage(req: Request, res: Response): Promise<any> {
        try {
            const contacts: IContact[] = await contactRepo.fetchContacts();

            res.render('pages/contact-requests', {
                title: "Contact Requests",
                data: {
                    url: req.url,
                    user: req.user,
                    contactList: contacts
                },
                messages: req.flash('message')
            });
        } catch (error: any) {
            console.log("error: ", error);
            req.flash('message', [{ msg: error.message || "Something went wrong! Please try again.", type: 'danger' }] as any);
            return res.redirect('/');
        }
    }

    async updateContactStatus(req: Request, res: Response): Promise<any> {
        try {
            const contactId: string = req.params.id || "";
            const status: any = req.body.status || "";

            if (!['pending', 'in-progress', 'resolved'].includes(status)) {
                req.flash('message', [{ msg: "Invalid status!", type: 'danger' }] as any);
                return res.redirect('/contact-requests');
            }

            const updatedContact: IContact = await contactRepo.updateContact(contactId, { status });
            if (!updatedContact) {
                req.flash('message', [{ msg: "Failed to update contact status!", type: 'danger' }] as any);
                return res.redirect('/contact-requests');
            }

            req.flash('message', [{ msg: "Status changed successfully", type: 'success' }] as any);
            return res.redirect('/contact-requests');
        } catch (error: any) {
            console.log("error: ", error);
            req.flash('message', [{ msg: error.message || "Something went wrong! Please try again.", type: 'danger' }] as any);
            return res.redirect('/');
        }
    }

    async deleteContact(req: Request, res: Response): Promise<any> {
        try {
            const contactId: string = req.params.id || "";
            await contactRepo.deleteContact(contactId);;

            req.flash('message', [{ msg: "Contact deleted successfully", type: 'success' }] as any);
            return res.redirect('/contact-requests');
        } catch (error: any) {
            console.log("error: ", error);
            req.flash('message', [{ msg: error.message || "Something went wrong! Please try again.", type: 'danger' }] as any);
            return res.redirect('/');
        }
    }

}

export default new contactController();