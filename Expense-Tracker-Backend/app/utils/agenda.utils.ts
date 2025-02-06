
import userRepositories from 'app/modules/user.module/repositories/user.repositories';
// import Expense from '../models/Expense.js';
import { Types } from 'mongoose';
import { IMailOptions, IUser } from '@interfaces';
import { sendEmail } from '@utils';

export const sendDailyExpenseReport = async (userId: string) => {
    const user: IUser | null = await userRepositories.findOneBy({ _id: new Types.ObjectId(userId) });
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    //   const expenses = await Expense.find({
    //     user: userId,
    //     date: {
    //       $gte: today,
    //       $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    //     }
    //   }).populate('category');

    //   const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    //   const report = generateExpenseReport(expenses, total, 'Daily');

    const mailOptions:IMailOptions = {
        from: 'no-reply@sayantan.com',
        to: user.email,
        subject: 'Daily Expense Report',
        html: '' //report
    }

    await sendEmail(mailOptions);
};

export const sendMonthlyExpenseReport = async (userId:string) => {
    const user: IUser | null = await userRepositories.findOneBy({ _id: new Types.ObjectId(userId) });
    if (!user) return;

    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    // const expenses = await Expense.find({
    //     user: userId,
    //     date: {
    //         $gte: firstDayOfMonth,
    //         $lt: new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth() + 1, 1)
    //     }
    // }).populate('category');

    // const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // const report = generateExpenseReport(expenses, total, 'Monthly');

    const mailOptions:IMailOptions = {
        from: 'no-reply@sayantan.com',
        to: user.email,
        subject: 'Monthly Expense Report',
        html: '' //report
    }
    await sendEmail(mailOptions);
};

// const generateExpenseReport = (expenses, total, type) => {
//     const categoryTotals = expenses.reduce((acc, expense) => {
//         const categoryName = expense.category.name;
//         acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
//         return acc;
//     }, {});

//     let html = `
//     <h2>${type} Expense Report</h2>
//     <p>Total Expenses: $${total.toFixed(2)}</p>
//     <h3>Breakdown by Category:</h3>
//     <ul>
//   `;

//     Object.entries(categoryTotals).forEach(([category, amount]) => {
//         html += `<li>${category}: $${amount.toFixed(2)}</li>`;
//     });

//     html += `</ul>`;
//     return html;
// };