const ExcelJS = require('exceljs');
const path = require('path');

async function exportJobsToExcel(jobs, filename = 'scraped_jobs.xlsx') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Jobs');

    // Add headers
    worksheet.columns = [
        { header: 'Title', key: 'title' },
        { header: 'Company', key: 'company' },
        { header: 'Location', key: 'location' },
        { header: 'Description', key: 'description' },
        { header: 'Salary', key: 'salary' },
        { header: 'Skills', key: 'skills' },
        { header: 'Source', key: 'source' },
        { header: 'URL', key: 'url' },
        { header: 'Timestamp', key: 'timestamp' }
    ];

    // Add data
    jobs.forEach(job => {
        worksheet.addRow({
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            salary: job.salary,
            skills: job.skills.join(', '),
            source: job.source,
            url: job.url,
            timestamp: job.timestamp
        });
    });

    // Format the worksheet
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
            cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'left' };
        });
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
        column.width = 20; // Set a reasonable default width
    });

    // Save the workbook
    const filePath = path.join(__dirname, '../../../../exports', filename);
    try {
        await workbook.xlsx.writeFile(filePath);
        console.log(`✅ Excel file saved to: ${filePath}`);
        return filePath;
    } catch (error) {
        console.error('❌ Error saving Excel file:', error.message);
        throw error;
    }
}

module.exports = {
    exportJobsToExcel
};
