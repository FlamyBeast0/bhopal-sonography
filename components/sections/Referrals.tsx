
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { Patient, PatientType, ReferralStatus } from '../../services/types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Modal from '../ui/Modal';
import { ExportIcon, PaymentPendingIcon, TotalRevenueIcon, EditIcon } from '../../constants';
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

const Referrals: React.FC = () => {
    const { patients, rateCard, updatePatient } = useContext(AppContext);
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [dateRange, setDateRange] = useState({ from: firstDayOfMonth, to: today });
    const [referralDoctorFilter, setReferralDoctorFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'all'>('all');
    
    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingReferral, setEditingReferral] = useState<Patient | null>(null);
    
    const referralPatients = useMemo(() => {
        return patients.filter(p => p.patientType === PatientType.Referral);
    }, [patients]);
    
    const referringDoctors = useMemo(() => {
        return [...new Set(referralPatients.map(p => p.pro).filter(Boolean))];
    }, [referralPatients]);
    
    const filteredReferrals = useMemo(() => {
        return referralPatients.filter(p => {
            const isDateInRange = p.date >= dateRange.from && p.date <= dateRange.to;
            const isDoctorMatch = referralDoctorFilter === 'all' || p.pro === referralDoctorFilter;
            const isStatusMatch = statusFilter === 'all' || p.referralStatus === statusFilter;
            return isDateInRange && isDoctorMatch && isStatusMatch;
        }).sort((a,b) => b.date.localeCompare(a.date));
    }, [referralPatients, dateRange, referralDoctorFilter, statusFilter]);
    
    const stats = useMemo(() => {
        const totalPending = filteredReferrals
            .filter(p => p.referralStatus === ReferralStatus.Pending || p.referralStatus === ReferralStatus.Partial)
            .reduce((acc, p) => acc + p.referralAmount, 0);
        const totalPaid = filteredReferrals
            .filter(p => p.referralStatus === ReferralStatus.Paid)
            .reduce((acc, p) => acc + p.referralAmount, 0);
        return { totalPending, totalPaid };
    }, [filteredReferrals]);

    const getTestName = (testId: string) => rateCard.find(t => t.id === testId)?.studyName || 'N/A';

    const openEditModal = (patient: Patient) => {
        setEditingReferral({ ...patient });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!editingReferral) return;
        const { name, value } = e.target;
        setEditingReferral(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleSaveEdit = () => {
        if (editingReferral) {
            // Auto-set paid date if status is Paid and date is missing
            let updatedData = { ...editingReferral };
            if (updatedData.referralStatus === ReferralStatus.Paid && !updatedData.paidDate) {
                updatedData.paidDate = new Date().toISOString().split('T')[0];
            }
            updatePatient(updatedData);
            setIsEditModalOpen(false);
            setEditingReferral(null);
        }
    };

    const handleExport = () => {
        const dataToExport = filteredReferrals.map((p, index) => ({
            'S.No': index + 1,
            'Date': p.date,
            'Patient Name': p.name,
            'Test': getTestName(p.testId),
            'Referring Doctor': p.pro,
            'Referral Amount (₹)': p.referralAmount,
            'Status': p.referralStatus,
            'Paid Date': p.paidDate || 'N/A',
            'Paid To': p.paidTo || 'N/A',
        }));
        exportToExcel(dataToExport, `referrals-report-${dateRange.from}-to-${dateRange.to}`);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <KPICard title="Total Pending Amount" value={`₹${stats.totalPending.toLocaleString('en-IN')}`} description="For selected period" icon={<PaymentPendingIcon className="w-6 h-6"/>} />
                <KPICard title="Total Paid Amount" value={`₹${stats.totalPaid.toLocaleString('en-IN')}`} description="For selected period" icon={<TotalRevenueIcon className="w-6 h-6"/>} />
            </div>

            <Card title="Manage Referrals">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 flex-wrap">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto flex-grow">
                        <Input label="From" type="date" name="from" value={dateRange.from} onChange={e => setDateRange(prev => ({...prev, from: e.target.value}))} containerClassName="flex-grow"/>
                        <Input label="To" type="date" name="to" value={dateRange.to} onChange={e => setDateRange(prev => ({...prev, to: e.target.value}))} containerClassName="flex-grow"/>
                        <Select label="Doctor/PRO" value={referralDoctorFilter} onChange={e => setReferralDoctorFilter(e.target.value)}>
                            <option value="all">All Doctors</option>
                            {referringDoctors.map(doc => <option key={doc} value={doc}>{doc}</option>)}
                        </Select>
                        <Select label="Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                            <option value="all">All Statuses</option>
                            {(Object.values(ReferralStatus) as string[]).map(status => <option key={status} value={status}>{status}</option>)}
                        </Select>
                    </div>
                     <Button onClick={handleExport} icon={<ExportIcon />} variant="secondary">Export</Button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                {['Date', 'Patient', 'Test', 'Doctor/PRO', 'Ref. Amount', 'Status', 'Paid Date', 'Paid To', 'Actions'].map(header => (
                                    <th key={header} className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700 [&>tr:nth-of-type(even)]:bg-slate-50 dark:[&>tr:nth-of-type(even)]:bg-slate-800/50">
                            {filteredReferrals.map(p => (
                                <tr key={p.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">{p.date}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{p.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{getTestName(p.testId)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{p.pro}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold">₹{p.referralAmount.toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            p.referralStatus === ReferralStatus.Paid ? 'bg-green-100 text-green-800' :
                                            p.referralStatus === ReferralStatus.Partial ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {p.referralStatus}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{p.paidDate || '-'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{p.paidTo || '-'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <button 
                                            onClick={() => openEditModal(p)}
                                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200 transition-colors"
                                            title="Update Payment Details"
                                        >
                                            <EditIcon className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredReferrals.length === 0 && (
                        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                            <p>No referral records found for the selected filters.</p>
                        </div>
                    )}
                </div>
            </Card>

            {editingReferral && (
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Referral Payment">
                    <div className="space-y-4">
                        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm">
                            <p><strong>Patient:</strong> {editingReferral.name}</p>
                            <p><strong>Ref. Doctor:</strong> {editingReferral.pro}</p>
                            <p><strong>Amount Due:</strong> ₹{editingReferral.referralAmount}</p>
                        </div>
                        <Select label="Status" name="referralStatus" value={editingReferral.referralStatus} onChange={handleEditChange}>
                            {(Object.values(ReferralStatus) as string[]).map(status => <option key={status} value={status}>{status}</option>)}
                        </Select>
                        <Input label="Paid Date" type="date" name="paidDate" value={editingReferral.paidDate || ''} onChange={handleEditChange} />
                        <Input label="Paid To" name="paidTo" value={editingReferral.paidTo || ''} onChange={handleEditChange} placeholder="Person receiving payment" />
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveEdit}>Save Changes</Button>
                    </div>
                </Modal>
            )}
        </div>
    )
}

export default Referrals;
