import { readFileSync, unlink } from 'fs';
import puppeteer, { Browser, Page } from 'puppeteer';

interface TableRow {
    date: string;
    category: any;
    description: string;
    amount: string;
    type: 'cash-in' | 'cash-out';
}

const generateHtml = (data: TableRow[], tableHeading:string, basePath:string): string => {
    const rows = data.map(row => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">${new Date(row.date).toLocaleDateString()}</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">${row.category?.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">${row.description}</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; color: ${row.type == 'cash-in' ? '#28a745' : '#dc3545'};">${row.type == 'cash-in' ? '+' : '-'} ₹${parseFloat(row.amount).toFixed(2)}</td>
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
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">

            <!-- Logo -->
            <img src="${basePath}/uploads/logo_full_white_bg.png" alt="Company Logo" style="max-width: 150px; margin-bottom: 15px;">

            <!-- Title -->
            <h2 style="color: #333333; margin-bottom: 5px;">Transaction Summary</h2>

            <!-- Description -->
            <p style="max-width: 600px; color: #555555; font-size: 14px; margin: 5px auto 20px auto; text-align: center;">
                Below is a summary of your ${tableHeading}. 
                If you have any questions, please contact our support team.
            </p>

            <!-- Raised Box for the Table -->
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px; text-align: center;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 12px; border-bottom: 2px solid #ddd;">Date</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ddd;">Category</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ddd;">Description</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ddd;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>

            <!-- Footer -->
            <p style="color: #777777; font-size: 12px; margin-top: 20px;">
                This is an automated email. Please do not reply. If you have any concerns, contact 
                <a href="mailto:support@example.com" style="color: #007bff; text-decoration: none;">support@example.com</a>.
            </p>

        </body>
        </html>
    `;
};

export const generateStatementPdf = async (data: Array<TableRow>, tableHeading:string, basePath:string, reportType: 'generated' | 'daily' | 'monthly') => {
    const browser:Browser = await puppeteer.launch({ headless: true });
    const page:Page = await browser.newPage();
    const htmlContent = generateHtml(data, tableHeading, basePath);

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