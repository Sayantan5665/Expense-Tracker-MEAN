import { readFileSync, unlink } from 'fs';
import puppeteer, { Browser, Page } from 'puppeteer';

interface TableRow {
    date: string;
    category: any;
    description: string;
    amount: string;
    type: 'cash-in' | 'cash-out';
}


const generateHtml = (data: TableRow[], tableHeading:string): string => {
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
                <h2 style="color: #333333; text-align: center;">${tableHeading}</h2>
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

export const generateStatementPdf = async (data: Array<TableRow>, tableHeading:string, reportType: 'generated' | 'monthly' | 'yearly') => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const htmlContent = generateHtml(data, tableHeading);

    await page.setContent(htmlContent);

    // Generate the PDF and save it to a buffer
    const pdfPath = `uploads/PDFs/statement-${Date.now()}.pdf`;
    await page.pdf({ path: pdfPath, format: 'A4' });

    await browser.close();

    // Read the saved PDF file and return it as a buffer
    const pdfBuffer = readFileSync(pdfPath);

    // Delete the saved PDF file
    await new Promise((resolve) => {
        unlink(pdfPath, resolve);
    });

    // Return the PDF buffer
    return pdfBuffer;
}