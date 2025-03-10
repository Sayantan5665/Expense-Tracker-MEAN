import puppeteer, { Browser, Page } from 'puppeteer';

interface TableRow {
    date: string;
    category: any;
    description: string;
    amount: string;
    type: 'cash-in' | 'cash-out';
}

// const generateHtml1 = (data: TableRow[]): string => {
//     const rows = data.map(row => `
//         <tr>
//             <td>${new Date(row.date).toLocaleDateString()}</td>
//             <td>${row.category}</td>
//             <td>${row.description}</td>
//             <td>${row.amount}</td>
//         </tr>
//     `).join('');

//     return `
//         <html>
//             <head>
//                 <style>
//                     table { width: 100%; border-collapse: collapse; }
//                     th, td { border: 1px solid black; padding: 8px; text-align: left; }
//                     th { background-color: #f2f2f2; }
//                 </style>
//             </head>
//             <body>
//                 <h1>Transaction Report</h1>
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>DATE</th>
//                             <th>CATEGORY</th>
//                             <th>DESCRIPTION</th>
//                             <th>AMOUNT</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         ${rows}
//                     </tbody>
//                 </table>
//             </body>
//         </html>
//     `;
// };


const generateHtml = (data: TableRow[]): string => {
    const rows = data.map(row => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">${new Date(row.date).toLocaleDateString()}</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">${row.category?.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">${row.description}</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; color: ${row.type == 'cash-in' ? '#28a745' : '#dc3545'};">${row.type == 'cash-in' ? '+' : '-'} ${row.amount}</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Transaction Summary</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #333333; text-align: center;">Transactions between 01/03/2025 and 20/03/2025</h2>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Date</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Category</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Description</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
    `;
};

export const generateStatementPdf = async (data: Array<TableRow>) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const htmlContent = generateHtml(data);

    await page.setContent(htmlContent);

    // Generate the PDF and save it to a buffer
    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();
    console.log('PDF created successfully!');

    // Return the PDF buffer
    return pdfBuffer;
}