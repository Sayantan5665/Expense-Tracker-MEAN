
import userRepositories from '../modules/user.module/repositories/user.repositories';
// import Expense from '../models/Expense.js';
import { Types } from 'mongoose';
import { IMailOptions, IUser } from '../interfaces/index';
import { generateStatementPdf, sendEmail } from './index';
import expenseRepository from '../modules/expense.module/repositories/expense.repository';


export const sendDailyMonthlyExpenseReport = async (userId: string, basePath:string, period: 'daily' | 'monthly'): Promise<any> => {
    try {
        const user: IUser | null = await userRepositories.findOneBy({ _id: new Types.ObjectId(userId), isActive: true });
        if (!user) return;

        const matchConditions: { userId: Types.ObjectId } & Record<string, any> = { userId: new Types.ObjectId(user.id) };

        const dateRange: { startDate?: Date, endDate?: Date } = {};

        const currentDate = new Date();

        if (period === 'daily') {
            // For daily report, set the start date to the beginning of the day (00:00:00) and end date to the end of the day (23:59:59.999)
            const startOfDay = new Date(currentDate);
            startOfDay.setHours(0, 0, 0, 0); // Set to 00:00:00.000

            const endOfDay = new Date(currentDate);
            endOfDay.setHours(23, 59, 59, 999); // Set to 23:59:59.999

            dateRange.startDate = startOfDay;
            dateRange.endDate = endOfDay;
        } else if (period === 'monthly') {
            // For monthly report, set the start date to the first day of the month at 00:00:00 and end date to the last day of the month at 23:59:59.999
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0); // First day of the month at 00:00:00
            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999); // Last day of the month at 23:59:59.999

            dateRange.startDate = firstDayOfMonth;
            dateRange.endDate = lastDayOfMonth;
        }

        console.log("sendDailyMonthlyExpenseReport dateRange: ", dateRange);
        const expenses = await expenseRepository.getExpensesReport(matchConditions, dateRange, { page:1, limit:0, pagination: false });
        console.log("sendDailyMonthlyExpenseReport expenses: ", expenses);

        let msg: string = '';
        if (period === 'daily') msg = 'today\'s expenses';
        else if (period ==='monthly') msg = 'this month\'s expenses';

        const pdf: Buffer<ArrayBufferLike> = await generateStatementPdf(expenses.docs, msg, basePath, period);

        const mailOptions: IMailOptions = {
            from: 'no-reply@sayantan.com',
            to: user.email,
            subject: 'Cashlytics E-statement',
            html: `
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">

                    <p style="margin-bottom: 15px;">
                        Dear <strong>${user.name}</strong>,
                    </p>

                    <p style="margin-bottom: 15px;">
                        Your Cashlytics e-statement of ${msg} is now being sent to you as a PDF document.
                        To open this file, you need <strong>Adobe Acrobat Reader</strong>. If you do not have Adobe Acrobat Reader, please visit the following link to download it:
                        <a href="http://www.adobe.com/products/acrobat/readstep2.html" style="color: #007bff; text-decoration: none;">www.adobe.com/products/acrobat/readstep2.html</a>.
                    </p>

                    <p style="margin-bottom: 15px;">
                        Add <strong>estatement@cashlytics.com</strong> to your <strong>white list / safe sender list</strong>. Else, your mailbox filter or ISP (Internet Service Provider) may stop you from receiving your e-mail account statement.
                    </p>

                    <p style="margin-bottom: 15px;">
                        Sincerely,
                        <br>
                        <strong>Team Cashlytics</strong>
                    </p>

                </body>
            `,
            attachments: [{
                filename: `statement-${Date.now()}.pdf`,
                content: pdf,
                contentType: "application/pdf"
            }]
        };
        await sendEmail(mailOptions);

    } catch (error: any) {
        console.error("error: ", error);
    }
}