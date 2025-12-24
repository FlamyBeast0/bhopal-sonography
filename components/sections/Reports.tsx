
import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Patient } from '../../services/types';
import { ExportIcon } from '../../constants';
import { exportToExcel } from '../../utils/exportUtils';

const Reports: React.FC = () => {
    const { patients, rateCard } = useContext(AppContext);
    const today = new Date().toISOString().split('T')[0];
    const [dateRange, setDateRange] = useState({ from: today, to: today });
    const [generatedReport, setGeneratedReport] = useState<Patient[] | null>(null);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const generateReport = () => {
        const reportData = patients.filter(p => p.date >= dateRange.from && p.date <= dateRange.to);
        setGeneratedReport(reportData);
    };

    const getTestName = (testId: string) => rateCard.find(t => t.id === testId)?.studyName || 'N/A';
    
    const reportStats = useMemo(() => {
        if (!generatedReport) return null;
        const totalRevenue = generatedReport.reduce((acc, p) => acc + p.amountReceived, 0);
        const patientCount = generatedReport.length;
        const averagePayment = patientCount > 0 ? totalRevenue / patientCount : 0;
        return { totalRevenue, patientCount, averagePayment };
    }, [generatedReport]);

    const handleExport = () => {
        if (!generatedReport) return;
        const dataToExport = generatedReport.map((p, index) => ({
            'S.No': index + 1,
            Date: p.date,
            Name: p.name,
            'Age/Gender': `${p.age}/${p.gender.charAt(0)}`,
            Contact: p.contact,
            Test: getTestName(p.testId),
            MRP: p.mrp,
            'Amount Received': p.amountReceived,
            'Amount Diff': p.mrp - p.amountReceived,
            Mode: p.paymentMode,
            'Doctor Ref': p.doctorRef,
        }));
        exportToExcel(dataToExport, `report-${dateRange.from}-to-${dateRange.to}`);
    };

    return (
        <div className="space-y-6">
            <Card title="Generate Reports">
                <div className="flex flex-wrap items-end gap-4">
                    <Input label="From Date" type="date" name="from" value={dateRange.from} onChange={handleDateChange} />
                    <Input label="To Date" type="date" name="to" value={dateRange.to} onChange={handleDateChange} />
                    <Button onClick={generateReport}>Generate Report</Button>
                </div>
            </Card>

            {generatedReport && (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Report for {dateRange.from} to {dateRange.to}</h3>
                        <Button onClick={handleExport} icon={<ExportIcon />}>Export</Button>
                    </div>

                    {reportStats && (
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Patients</p>
                                <p className="text-2xl font-bold">{reportStats.patientCount}</p>
                            </div>
                            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                                <p className="text-2xl font-bold">₹{reportStats.totalRevenue.toLocaleString('en-IN')}</p>
                            </div>
                             <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Average Payment</p>
                                <p className="text-2xl font-bold">₹{reportStats.averagePayment.toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                   
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                     {['S.No', 'Date', 'Name', 'Test', 'MRP', 'Received'].map(header => (
                                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
                                     ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {generatedReport.map((p, index) => (
                                    <tr key={p.id}>
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <td className="px-6 py-4">{p.date}</td>
                                        <td className="px-6 py-4 font-medium">{p.name}</td>
                                        <td className="px-6 py-4">{getTestName(p.testId)}</td>
                                        <td className="px-6 py-4">{p.mrp}</td>
                                        <td className="px-6 py-4">{p.amountReceived}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Reports;
