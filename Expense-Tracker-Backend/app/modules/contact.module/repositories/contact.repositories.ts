import { Types } from "mongoose";
import { IContact } from "../../../interfaces/index";
import { contactModel, contactValidator } from "../models/contact.model";

class contactRepo {
    async addContact(body: IContact): Promise<IContact> {
        try {
            body.status = 'pending';
            const { error } = contactValidator.validate(body);
            if (error) throw error;

            const data = new contactModel(body);
            const newContact: IContact = await data.save();
            return newContact;
        } catch (error) {
            throw error;
        }
    }

    async updateContact(id: string, body: {status: 'pending' | 'in-progress' | 'resolved'}): Promise<IContact> {
        try {
            const contact: IContact | null = await contactModel.findByIdAndUpdate(id, body, { new: true });
            if (!contact) throw new Error("Contact not found");

            return contact;
        } catch (error) {
            throw error;
        }
    }

    async fetchContacts(): Promise<Array<IContact>> {
        try {
            const contacts: Array<IContact> = await contactModel.find();
            return contacts;
        } catch (error) {
            throw error;
        }
    }

    async getContactBy(condition: { _id: Types.ObjectId } | { email: string }): Promise<IContact | null> {
        try {
            const contact: IContact | null = await contactModel.findOne(condition);
            return contact;
        } catch (error) {
            throw error;
        }
    }

    async deleteContact(id: string): Promise<IContact> {
        try {
            const contact: IContact | null = await contactModel.findById(id);
            if (!contact) throw new Error("Contact not found");

            await contactModel.findByIdAndDelete(id);
            return contact;
        } catch (error) {
            throw error;
        }
    }
}

export default new contactRepo();