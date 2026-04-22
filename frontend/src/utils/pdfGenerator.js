import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PRIMARY = [47, 47, 143];
const WHITE = [255, 255, 255];
const LIGHT_BG = [245, 247, 252];
const DARK_TEXT = [30, 30, 30];

function addHeader(doc, title, subtitle) {
    // Blue header bar
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, 210, 38, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...WHITE);
    doc.text('INDIAN RAILWAYS', 105, 14, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Ministry of Railways, Government of India', 105, 21, { align: 'center' });

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 105, 30, { align: 'center' });

    if (subtitle) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(subtitle, 105, 36, { align: 'center' });
    }

    // Reset color
    doc.setTextColor(...DARK_TEXT);
}

function addSectionTitle(doc, text, y) {
    doc.setFillColor(...PRIMARY);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...WHITE);
    doc.text(text, 17, y + 4.8);
    doc.setTextColor(...DARK_TEXT);
    return y + 10;
}

function addFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5);
        doc.setTextColor(150, 150, 150);
        doc.line(14, 285, 196, 285);
        doc.text('This is a computer-generated document. No signature is required.', 105, 289, { align: 'center' });
        doc.text(`Page ${i} of ${pageCount}`, 196, 289, { align: 'right' });
        doc.text('Indian Railways Management System — Confidential', 14, 289);
    }
}

export const generatePayslipPDF = (employee, salaryRecord) => {
    const doc = new jsPDF();
    addHeader(doc, 'EMPLOYEE PAY SLIP', `For the Month of: ${salaryRecord.month_year}`);

    let y = 46;

    // Employee details
    y = addSectionTitle(doc, 'EMPLOYEE INFORMATION', y);
    autoTable(doc, {
        startY: y,
        body: [
            ['Employee Name', employee.name || 'N/A', 'Employee ID', employee.employee_id || 'N/A'],
            ['Designation', employee.designation || 'N/A', 'Department', employee.department || 'N/A'],
            ['Work Location', employee.work_location || 'N/A', 'Date of Joining', employee.joining_date ? new Date(employee.joining_date).toLocaleDateString('en-IN') : 'N/A'],
            ['PAN Number', employee.pan_number || 'N/A', 'Aadhaar', employee.aadhaar_number || 'N/A'],
        ],
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold', textColor: [80, 80, 80], cellWidth: 38 },
            1: { cellWidth: 57 },
            2: { fontStyle: 'bold', textColor: [80, 80, 80], cellWidth: 38 },
            3: { cellWidth: 57 },
        },
        alternateRowStyles: { fillColor: LIGHT_BG },
    });

    y = doc.lastAutoTable.finalY + 8;
    y = addSectionTitle(doc, 'EARNINGS & DEDUCTIONS', y);
    autoTable(doc, {
        startY: y,
        head: [['Earnings', 'Amount (INR)', 'Deductions', 'Amount (INR)']],
        body: [
            ['Basic Pay (50%)', `Rs. ${parseFloat(salaryRecord.basic_pay).toFixed(2)}`, 'Provident Fund (12%)', `Rs. ${parseFloat(salaryRecord.deductions).toFixed(2)}`],
            ['House Rent Allowance (20%)', `Rs. ${parseFloat(salaryRecord.hra).toFixed(2)}`, '', ''],
            ['Special Allowances (30%)', `Rs. ${parseFloat(salaryRecord.allowances).toFixed(2)}`, '', ''],
        ],
        theme: 'grid',
        headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
            0: { cellWidth: 70 }, 1: { cellWidth: 30, halign: 'right' },
            2: { cellWidth: 60 }, 3: { cellWidth: 30, halign: 'right' },
        },
    });

    // Summary row
    const totalEarnings = parseFloat(salaryRecord.basic_pay) + parseFloat(salaryRecord.hra) + parseFloat(salaryRecord.allowances);
    const totalDeductions = parseFloat(salaryRecord.deductions);
    const net = parseFloat(salaryRecord.net_salary);
    y = doc.lastAutoTable.finalY;

    autoTable(doc, {
        startY: y,
        body: [
            [
                { content: 'GROSS EARNINGS', styles: { fontStyle: 'bold', halign: 'right', fillColor: [230, 240, 255] } },
                { content: `Rs. ${totalEarnings.toFixed(2)}`, styles: { fontStyle: 'bold', halign: 'right', fillColor: [230, 240, 255] } },
                { content: 'TOTAL DEDUCTIONS', styles: { fontStyle: 'bold', halign: 'right', fillColor: [255, 235, 235] } },
                { content: `Rs. ${totalDeductions.toFixed(2)}`, styles: { fontStyle: 'bold', halign: 'right', fillColor: [255, 235, 235] } },
            ],
            [
                { content: 'NET PAY', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right', fillColor: PRIMARY, textColor: WHITE, fontSize: 10 } },
                { content: `Rs. ${net.toFixed(2)}`, styles: { fontStyle: 'bold', halign: 'right', fillColor: PRIMARY, textColor: WHITE, fontSize: 10 } },
            ],
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
            0: { cellWidth: 70 }, 1: { cellWidth: 30, halign: 'right' },
            2: { cellWidth: 60 }, 3: { cellWidth: 30, halign: 'right' },
        },
    });

    y = doc.lastAutoTable.finalY + 10;
    // Status stamp
    doc.setFillColor(212, 237, 218);
    doc.roundedRect(14, y, 182, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(21, 87, 36);
    doc.text(`Payment Status: ${(salaryRecord.status || 'PAID').toUpperCase()}   |   Payment Date: ${salaryRecord.payment_date ? new Date(salaryRecord.payment_date).toLocaleDateString('en-IN') : 'N/A'}`, 105, y + 9, { align: 'center' });
    doc.setTextColor(...DARK_TEXT);

    addFooter(doc);
    doc.save(`Payslip_${employee.employee_id}_${salaryRecord.month_year.replace(' ', '_')}.pdf`);
};

export const generateAnnualPayslipPDF = (employee, salaryHistory) => {
    const doc = new jsPDF({ orientation: 'landscape' });

    // Determine year from first record or current year
    const year = salaryHistory.length > 0
        ? salaryHistory[0].month_year.split(' ')[1]
        : new Date().getFullYear();

    addHeader(doc, 'ANNUAL SALARY STATEMENT', `Financial Year: ${parseInt(year) - 1}-${year} | Employee: ${employee.name}`);

    let y = 46;
    y = addSectionTitle(doc, 'EMPLOYEE INFORMATION', y);
    autoTable(doc, {
        startY: y,
        body: [
            ['Employee Name', employee.name || 'N/A', 'Employee ID', employee.employee_id || 'N/A', 'Designation', employee.designation || 'N/A'],
            ['Department', employee.department || 'N/A', 'Work Location', employee.work_location || 'N/A', 'Annual Salary', employee.salary ? `Rs. ${parseFloat(employee.salary).toLocaleString('en-IN')}` : 'N/A'],
            ['PAN Number', employee.pan_number || 'N/A', 'Aadhaar', employee.aadhaar_number || 'N/A', 'Date of Joining', employee.joining_date ? new Date(employee.joining_date).toLocaleDateString('en-IN') : 'N/A'],
        ],
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold', textColor: [80, 80, 80], cellWidth: 38 },
            1: { cellWidth: 55 },
            2: { fontStyle: 'bold', textColor: [80, 80, 80], cellWidth: 35 },
            3: { cellWidth: 55 },
            4: { fontStyle: 'bold', textColor: [80, 80, 80], cellWidth: 35 },
            5: { cellWidth: 55 },
        },
        alternateRowStyles: { fillColor: LIGHT_BG },
    });

    y = doc.lastAutoTable.finalY + 8;
    y = addSectionTitle(doc, 'MONTHLY SALARY BREAKDOWN', y);

    autoTable(doc, {
        startY: y,
        head: [['Month', 'Basic Pay', 'HRA', 'Allowances', 'Gross Earnings', 'Deductions (PF)', 'Net Salary', 'Status', 'Payment Date']],
        body: salaryHistory.map(r => [
            r.month_year,
            `Rs. ${parseFloat(r.basic_pay).toFixed(2)}`,
            `Rs. ${parseFloat(r.hra).toFixed(2)}`,
            `Rs. ${parseFloat(r.allowances).toFixed(2)}`,
            `Rs. ${(parseFloat(r.basic_pay) + parseFloat(r.hra) + parseFloat(r.allowances)).toFixed(2)}`,
            `Rs. ${parseFloat(r.deductions).toFixed(2)}`,
            `Rs. ${parseFloat(r.net_salary).toFixed(2)}`,
            (r.status || 'paid').toUpperCase(),
            r.payment_date ? new Date(r.payment_date).toLocaleDateString('en-IN') : 'N/A',
        ]),
        headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: LIGHT_BG },
    });

    // Annual totals
    const totals = salaryHistory.reduce((acc, r) => ({
        basic: acc.basic + parseFloat(r.basic_pay || 0),
        hra: acc.hra + parseFloat(r.hra || 0),
        allowances: acc.allowances + parseFloat(r.allowances || 0),
        deductions: acc.deductions + parseFloat(r.deductions || 0),
        net: acc.net + parseFloat(r.net_salary || 0),
    }), { basic: 0, hra: 0, allowances: 0, deductions: 0, net: 0 });

    const grossTotal = totals.basic + totals.hra + totals.allowances;

    autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        body: [[
            { content: 'ANNUAL TOTALS', styles: { fontStyle: 'bold', fillColor: PRIMARY, textColor: WHITE } },
            { content: `Rs. ${totals.basic.toFixed(2)}`, styles: { fontStyle: 'bold', fillColor: PRIMARY, textColor: WHITE, halign: 'right' } },
            { content: `Rs. ${totals.hra.toFixed(2)}`, styles: { fontStyle: 'bold', fillColor: PRIMARY, textColor: WHITE, halign: 'right' } },
            { content: `Rs. ${totals.allowances.toFixed(2)}`, styles: { fontStyle: 'bold', fillColor: PRIMARY, textColor: WHITE, halign: 'right' } },
            { content: `Rs. ${grossTotal.toFixed(2)}`, styles: { fontStyle: 'bold', fillColor: PRIMARY, textColor: WHITE, halign: 'right' } },
            { content: `Rs. ${totals.deductions.toFixed(2)}`, styles: { fontStyle: 'bold', fillColor: PRIMARY, textColor: WHITE, halign: 'right' } },
            { content: `Rs. ${totals.net.toFixed(2)}`, styles: { fontStyle: 'bold', fillColor: PRIMARY, textColor: WHITE, halign: 'right' } },
            { content: `${salaryHistory.length} months`, styles: { fontStyle: 'bold', fillColor: PRIMARY, textColor: WHITE, halign: 'center' } },
            { content: '', styles: { fillColor: PRIMARY } },
        ]],
        styles: { fontSize: 8, cellPadding: 3 },
    });

    addFooter(doc);
    doc.save(`Annual_Statement_${employee.employee_id}_${year}.pdf`);
};
