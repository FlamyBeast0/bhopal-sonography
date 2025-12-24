
import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import { PaymentMode } from '../../services/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { ExportIcon, PatientsIcon, TotalRevenueIcon, AveragePaymentIcon, PaymentPendingIcon } from '../../constants';
import { exportToExcel } from '../../utils/exportUtils';

interface KPICardProps {
    title: string;
    value: string | number;
    description: string;
    icon: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, description, icon }) => (
    <Card className="!rounded-xl group !p-0 overflow-hidden">
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h4>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{value}</p>
                </div>
                <div className="bg-primary-500/10 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 p-3 rounded-lg transition-transform duration-300 group-hover:scale-110">
                    {icon}
                </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
         <div className="bg-primary-500/20 h-1 w-full mt-2 transition-all duration-300 group-hover:w-1/2" />
    </Card>
);

const Billing: React.FC = () => {
    const { patients, rateCard } = useContext(AppContext);
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const [filter, setFilter] = useState<'today' | 'month' | 'custom'>('month');
    const [dateRange, setDateRange] = useState({ from: firstDayOfMonth, to: today });

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const getTestName = (testId: string) => rateCard.find(t => t.id === testId)?.studyName || 'N/A';

    const filteredPatients = useMemo(() => {
        if (filter === 'today') {
            return patients.filter(p => p.date === today);
        }
        if (filter === 'month') {
            return patients.filter(p => p.date >= firstDayOfMonth && p.date <= today);
        }
        if (filter === 'custom') {
            return patients.filter(p => p.date >= dateRange.from && p.date <= dateRange.to);
        }
        return patients;
    }, [patients, filter, dateRange, today, firstDayOfMonth]);
    
    const billingStats = useMemo(() => {
        const totalRevenue = filteredPatients.reduce((acc, p) => acc + p.amountReceived, 0);
        const totalPatients = filteredPatients.length;
        const averagePayment = totalPatients > 0 ? (totalRevenue / totalPatients) : 0;
        const paymentPending = filteredPatients.reduce((acc, p) => acc + (p.mrp - p.amountReceived), 0);
        return { totalRevenue, totalPatients, averagePayment, paymentPending };
    }, [filteredPatients]);

    const paymentBreakdown = useMemo(() => {
        const breakdown = Object.values(PaymentMode).map(mode => ({ name: mode, count: 0, amount: 0 }));
        filteredPatients.forEach(p => {
            const modeData = breakdown.find(b => b.name === p.paymentMode);
            if (modeData) {
                modeData.count++;
                modeData.amount += p.amountReceived;
            }
        });
        return breakdown;
    }, [filteredPatients]);

    const handleExport = () => {
        const dataToExport = filteredPatients.map((p, index) => ({
            'S.No': index + 1,
            Date: p.date,
            Name: p.name,
            Test: getTestName(p.testId),
            MRP: p.mrp,
            'Amount Received': p.amountReceived,
            'Amount Diff': p.mrp - p.amountReceived,
            Mode: p.paymentMode,
        }));
        exportToExcel(dataToExport, `billing-report-${dateRange.from}-to-${dateRange.to}`);
    };
    
    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</label>
                            <select value={filter} onChange={e => setFilter(e.target.value as any)} className="bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm focus:ring-primary-500/50 focus:border-primary-500">
                                <option value="today">Today's Summary</option>
                                <option value="month">This Month</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                        {filter === 'custom' && (
                            <div className="flex items-center gap-4">
                                <Input label="" type="date" name="from" value={dateRange.from} onChange={handleDateChange} />
                                <Input label="" type="date" name="to" value={dateRange.to} onChange={handleDateChange} />
                            </div>
                        )}
                    </div>
                     <Button onClick={handleExport} icon={<ExportIcon />} variant="secondary">Export Data</Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Total Patients" value={billingStats.totalPatients} description="In selected period" icon={<PatientsIcon className="w-6 h-6"/>} />
                <KPICard title="Total Revenue" value={`₹${billingStats.totalRevenue.toLocaleString('en-IN')}`} description="Amount received" icon={<TotalRevenueIcon className="w-6 h-6"/>} />
                <KPICard title="Average Payment" value={`₹${billingStats.averagePayment.toFixed(2)}`} description="Per patient" icon={<AveragePaymentIcon className="w-6 h-6"/>} />
                <KPICard title="Payment Pending" value={`₹${billingStats.paymentPending.toLocaleString('en-IN')}`} description="Amount difference" icon={<PaymentPendingIcon className="w-6 h-6"/>} />
            </div>

            <Card title="Payment Breakdown">
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={paymentBreakdown} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                            <XAxis dataKey="name" className="text-xs fill-gray-600 dark:fill-gray-400" />
                            <YAxis yAxisId="left" orientation="left" stroke="var(--color-primary-600)" className="text-xs fill-gray-600 dark:fill-gray-400" />
                            <YAxis yAxisId="right" orientation="right" stroke="var(--color-primary-500)" className="text-xs fill-gray-600 dark:fill-gray-400" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(5px)',
                                    border: '1px solid #ddd',
                                    borderRadius: '0.5rem',
                                    color: '#333'
                                }}
                                cursor={{ fill: 'rgba(120, 120, 120, 0.1)' }}
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="count" fill="var(--color-primary-600)" name="Number of Patients" radius={[4, 4, 0, 0]} />
                            <Bar yAxisId="right" dataKey="amount" fill="var(--color-primary-500)" name="Total Amount (₹)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default Billing;
