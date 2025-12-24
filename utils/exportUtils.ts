
const convertToCSV = <T extends object,>(data: T[]): string => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','), // header row
        ...data.map(row => 
            headers.map(fieldName => {
                const value = (row as any)[fieldName];
                const stringValue = value === null || value === undefined ? '' : String(value);
                // Escape commas and quotes
                const escapedValue = stringValue.includes(',') || stringValue.includes('"') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
                return escapedValue;
            }).join(',')
        )
    ];
    return csvRows.join('\n');
};

export const exportToExcel = <T extends object,>(data: T[], filename: string) => {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
