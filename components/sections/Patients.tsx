
import React, { useContext, useState, useMemo, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { Patient, PaymentMode, PatientType, ReferralStatus, RateCardItem, QueueStatus } from '../../services/types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Modal from '../ui/Modal';
import { EditIcon, DeleteIcon, SearchIcon, ExportIcon } from '../../constants';
import { exportToExcel } from '../../utils/exportUtils';

const ROWS_PER_PAGE = 15;

const headerConfig: { name: string; key: keyof Patient | 'tokenNumber' | null; sortable: boolean }[] = [
    { name: 'S.No', key: null, sortable: false },
    { name: 'Token', key: 'tokenNumber', sortable: true},
    { name: 'Date', key: 'date', sortable: true },
    { name: 'Name', key: 'name', sortable: true },
    { name: 'Test', key: 'testId', sortable: true },
    { name: 'Queue Status', key: 'queueStatus', sortable: true },
    { name: 'Queue Actions', key: null, sortable: false },
    { name: 'Details Actions', key: null, sortable: false },
];

const Patients: React.FC = () => {
    const { patients, deletePatient, updatePatient, updatePatientQueueStatus, rateCard } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Patient, direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc'});
    
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

    const getTestName = (testId: string) => rateCard.find(t => t.id === testId)?.studyName || 'N/A';
    const today = new Date().toISOString().split('T')[0];

    const filteredPatients = useMemo(() => {
        return patients.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.contact.includes(searchTerm) ||
            getTestName(p.testId).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [patients, searchTerm, rateCard]);

    const sortedPatients = useMemo(() => {
        let sortableItems = [...filteredPatients];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                if (typeof valA === 'string' && typeof valB === 'string') {
                    return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                }
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredPatients, sortConfig]);

    const paginatedPatients = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        return sortedPatients.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [sortedPatients, currentPage]);

    const totalPages = Math.ceil(sortedPatients.length / ROWS_PER_PAGE);

    const requestSort = (key: keyof Patient) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleDeleteConfirm = () => {
        if (patientToDelete) {
            deletePatient(patientToDelete.id);
            setPatientToDelete(null);
        }
    };
    
    const handleEditClick = (patient: Patient) => {
        setEditingPatient({ ...patient });
        setIsEditModalOpen(true);
    };

    const handleUpdatePatient = () => {
        if (editingPatient) {
            updatePatient(editingPatient);
            setIsEditModalOpen(false);
            setEditingPatient(null);
        }
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!editingPatient) return;
        const { name, value } = e.target;
        const numericFields = ['age', 'mrp', 'amountReceived'];
        setEditingPatient({
            ...editingPatient,
            [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value,
        });
    };
    
    const getStatusColor = (status: QueueStatus) => {
        switch(status) {
            case QueueStatus.Waiting: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case QueueStatus.InProgress: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            case QueueStatus.Completed: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleExport = () => {
        const dataToExport = sortedPatients.map((p, index) => ({
            'S.No': index + 1,
            'Token': p.tokenNumber,
            Date: p.date,
            Name: p.name,
            'Age/Gender': `${p.age}/${p.gender.charAt(0)}`,
            Contact: p.contact,
            Test: getTestName(p.testId),
            MRP: p.mrp,
            'Amount Received': p.amountReceived,
            'Amount Diff': p.mrp - p.amountReceived,
            Mode: p.paymentMode,
            'Queue Status': p.queueStatus,
            'Doctor Ref': p.doctorRef,
        }));
        exportToExcel(dataToExport, `patients-records-${new Date().toISOString().split('T')[0]}`);
    };

    return (
        <Card title="Patient Records">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-1/3">
                    <label htmlFor="search" className="sr-only">Search</label>
                    <Input 
                        label=""
                        id="search"
                        type="text"
                        placeholder="Search by name, contact, test..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        containerClassName="w-full"
                    />
                     <SearchIcon className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none"/>
                </div>
                <Button onClick={handleExport} icon={<ExportIcon />} variant="secondary">Export to Excel</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            {headerConfig.map(({ name, key, sortable }) => (
                                <th 
                                    key={name} 
                                    scope="col" 
                                    onClick={() => sortable && key && requestSort(key as keyof Patient)} 
                                    className={`px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider ${sortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600/50' : ''}`}
                                >
                                    {name} {sortConfig?.key === key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700 [&>tr:nth-of-type(even)]:bg-slate-50 dark:[&>tr:nth-of-type(even)]:bg-slate-800/50">
                        {paginatedPatients.map((p, index) => (
                            <tr key={p.id} className="hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{(currentPage - 1) * ROWS_PER_PAGE + index + 1}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-primary-600 dark:text-primary-400 text-center">{p.tokenNumber}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">{p.date}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{p.name}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{getTestName(p.testId)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(p.queueStatus)}`}>
                                        {p.queueStatus}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                                    {p.date === today && p.queueStatus === QueueStatus.Waiting && <Button className="px-2 py-1 text-xs" onClick={() => updatePatientQueueStatus(p.id, QueueStatus.InProgress)}>Call</Button>}
                                    {p.date === today && p.queueStatus === QueueStatus.InProgress && <Button className="px-2 py-1 text-xs" variant="secondary" onClick={() => updatePatientQueueStatus(p.id, QueueStatus.Completed)}>Finish</Button>}
                                    {p.date === today && p.queueStatus !== QueueStatus.Waiting && <Button className="px-2 py-1 text-xs" variant="ghost" onClick={() => updatePatientQueueStatus(p.id, QueueStatus.Waiting)}>Revert</Button>}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button title="Edit Patient" onClick={() => handleEditClick(p)} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200"><EditIcon className="w-5 h-5"/></button>
                                    <button title="Delete Patient" onClick={() => setPatientToDelete(p)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><DeleteIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             <div className="py-4 flex items-center justify-between">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{Math.min(1 + (currentPage - 1) * ROWS_PER_PAGE, sortedPatients.length)}</span> to <span className="font-medium">{Math.min(currentPage * ROWS_PER_PAGE, sortedPatients.length)}</span> of <span className="font-medium">{sortedPatients.length}</span> results
                </p>
                <div className="flex-1 flex justify-end space-x-2">
                    <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                    <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                </div>
            </div>

            <Modal isOpen={!!patientToDelete} onClose={() => setPatientToDelete(null)} title="Confirm Deletion">
                <p className="text-gray-600 dark:text-gray-300">Are you sure you want to delete the record for {patientToDelete?.name}? This action cannot be undone.</p>
                <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="secondary" onClick={() => setPatientToDelete(null)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>Delete</Button>
                </div>
            </Modal>

            {editingPatient && (
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Patient: ${editingPatient.name}`}>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <Input label="Date" type="date" name="date" value={editingPatient.date} onChange={handleEditFormChange} required />
                             <Input label="Patient Name" name="name" value={editingPatient.name} onChange={handleEditFormChange} required />
                             {/* Other fields... */}
                         </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdatePatient}>Save Changes</Button>
                    </div>
                </Modal>
            )}
        </Card>
    );
};

export default Patients;
