
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import { PatientsIcon, TotalRevenueIcon, PaymentPendingIcon, LaunchIcon, PlusIcon, ExpensesIcon } from '../../constants';
import { QueueStatus } from '../../services/types';

interface DashboardProps {
    setActiveSection: (section: string) => void;
}

const StatCard = ({ title, value, subtext, icon, colorClass }: any) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-100 dark:border-slate-700 flex items-start justify-between transform transition-all hover:scale-105">
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</h3>
            <p className="text-xs text-slate-400 mt-2">{subtext}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClass} text-white shadow-md`}>
            {icon}
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ setActiveSection }) => {
    const { patients, rateCard, expenses } = useContext(AppContext);
    const today = new Date().toISOString().split('T')[0];

    const stats = useMemo(() => {
        const todaysPatients = patients.filter(p => p.date === today);
        const revenue = todaysPatients.reduce((acc, p) => acc + p.amountReceived, 0);
        const pending = todaysPatients.reduce((acc, p) => acc + (p.mrp - p.amountReceived), 0);
        const waiting = todaysPatients.filter(p => p.queueStatus === QueueStatus.Waiting).length;
        
        const todaysExpenses = expenses.filter(e => e.date === today).reduce((acc, e) => acc + e.amount, 0);
        const netIncome = revenue - todaysExpenses;

        return {
            patientCount: todaysPatients.length,
            revenue,
            pending,
            waiting,
            todaysExpenses,
            netIncome
        };
    }, [patients, expenses, today]);

    const recentPatients = useMemo(() => {
        return [...patients].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);
    }, [patients]);

    const getTestName = (testId: string) => rateCard.find(t => t.id === testId)?.studyName || 'N/A';

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome Back, Admin 👋</h2>
                    <p className="text-slate-500 dark:text-slate-400">Here is what's happening at the clinic today.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setActiveSection('New Entry')}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                    >
                        <PlusIcon className="w-5 h-5" />
                        New Patient
                    </button>
                    <button 
                        onClick={() => setActiveSection('Patient Queue')}
                        className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:bg-slate-700 transition-all"
                    >
                        <LaunchIcon className="w-5 h-5" />
                        Queue Display
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Patients Today" 
                    value={stats.patientCount} 
                    subtext="Total registrations"
                    icon={<PatientsIcon className="w-6 h-6"/>}
                    colorClass="bg-blue-500"
                />
                <StatCard 
                    title="Revenue Today" 
                    value={`₹${stats.revenue.toLocaleString('en-IN')}`} 
                    subtext="Cash & Online collected"
                    icon={<TotalRevenueIcon className="w-6 h-6"/>}
                    colorClass="bg-green-500"
                />
                 <StatCard 
                    title="Expenses Today" 
                    value={`₹${stats.todaysExpenses.toLocaleString('en-IN')}`} 
                    subtext="Total daily expenses"
                    icon={<ExpensesIcon className="w-6 h-6"/>}
                    colorClass="bg-rose-500"
                />
                <StatCard 
                    title="Net Income Today" 
                    value={`₹${stats.netIncome.toLocaleString('en-IN')}`} 
                    subtext="Revenue - Expenses"
                    icon={<TotalRevenueIcon className="w-6 h-6"/>}
                    // Dynamic Color: Indigo for profit, Red for loss
                    colorClass={stats.netIncome >= 0 ? "bg-indigo-500" : "bg-red-600"}
                />
                <StatCard 
                    title="Waiting Queue" 
                    value={stats.waiting} 
                    subtext="Patients waiting"
                    icon={<LaunchIcon className="w-6 h-6"/>}
                    colorClass="bg-orange-500"
                />
                <StatCard 
                    title="Pending Amount" 
                    value={`₹${stats.pending.toLocaleString('en-IN')}`} 
                    subtext="To be collected"
                    icon={<PaymentPendingIcon className="w-6 h-6"/>}
                    colorClass="bg-red-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card title="Recent Patients">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Token</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Test</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {recentPatients.length > 0 ? recentPatients.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                            <td className="px-4 py-3 text-sm font-bold text-primary-600 dark:text-primary-400">#{p.tokenNumber}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{p.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{getTestName(p.testId)}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    p.queueStatus === QueueStatus.Completed ? 'bg-green-100 text-green-800' :
                                                    p.queueStatus === QueueStatus.InProgress ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {p.queueStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">₹{p.amountReceived}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No patients found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 text-right">
                             <button onClick={() => setActiveSection('Patients')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All Patients &rarr;</button>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                     <Card title="Quick Actions">
                        <div className="space-y-3">
                            <button onClick={() => setActiveSection('New Entry')} className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 border border-gray-200 dark:border-slate-600 group">
                                <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                    <PlusIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">Register Patient</h4>
                                    <p className="text-xs text-gray-500">Add new entry for today</p>
                                </div>
                            </button>
                             <button onClick={() => setActiveSection('Billing')} className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 border border-gray-200 dark:border-slate-600 group">
                                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <TotalRevenueIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">View Billing</h4>
                                    <p className="text-xs text-gray-500">Check today's collections</p>
                                </div>
                            </button>
                             <button onClick={() => setActiveSection('Expenses')} className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 border border-gray-200 dark:border-slate-600 group">
                                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <PaymentPendingIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">Add Expense</h4>
                                    <p className="text-xs text-gray-500">Record clinic expenses</p>
                                </div>
                            </button>
                        </div>
                     </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
