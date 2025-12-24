
import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { Expense, ExpenseCategory } from '../../services/types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Modal from '../ui/Modal';
import { PlusIcon, EditIcon, DeleteIcon, ExportIcon } from '../../constants';
import { exportToExcel } from '../../utils/exportUtils';

const Expenses: React.FC = () => {
    const { expenses, addExpense, updateExpense, deleteExpense, addToast } = useContext(AppContext);
    
    const initialState = {
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        category: ExpenseCategory.Miscellaneous,
        paidTo: '',
    };
    
    const [formData, setFormData] = useState(initialState);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const [dateRange, setDateRange] = useState({ from: firstDayOfMonth, to: today });

    const filteredExpenses = useMemo(() => {
        return expenses.filter(e => e.date >= dateRange.from && e.date <= dateRange.to).sort((a, b) => b.date.localeCompare(a.date));
    }, [expenses, dateRange]);

    const totalExpenses = useMemo(() => {
        return filteredExpenses.reduce((acc, expense) => acc + expense.amount, 0);
    }, [filteredExpenses]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description || formData.amount <= 0) {
            addToast('Description and a valid amount are required.', 'error');
            return;
        }
        addExpense({ ...formData, id: Date.now().toString() });
        setFormData(initialState);
    };

    const handleEditClick = (expense: Expense) => {
        setEditingExpense({ ...expense });
        setIsEditModalOpen(true);
    };

    const handleUpdateExpense = () => {
        if (editingExpense) {
            updateExpense(editingExpense);
            setIsEditModalOpen(false);
            setEditingExpense(null);
        }
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!editingExpense) return;
        const { name, value } = e.target;
        setEditingExpense({
            ...editingExpense,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value,
        });
    };
    
    const handleDeleteConfirm = () => {
        if (expenseToDelete) {
            deleteExpense(expenseToDelete.id);
            setExpenseToDelete(null);
        }
    };

    const handleExport = () => {
        const dataToExport = filteredExpenses.map((e, index) => ({
            'S.No': index + 1,
            Date: e.date,
            Description: e.description,
            Category: e.category,
            'Paid To': e.paidTo,
            'Amount (₹)': e.amount,
        }));
        exportToExcel(dataToExport, `expenses-report-${dateRange.from}-to-${dateRange.to}`);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Add New Expense" className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Date" type="date" name="date" value={formData.date} onChange={handleFormChange} required />
                        <Input label="Description" name="description" value={formData.description} onChange={handleFormChange} required placeholder="e.g., Tea for staff" />
                        <Input label="Amount (₹)" type="number" name="amount" value={formData.amount === 0 ? '' : formData.amount} onChange={handleFormChange} required min="0" />
                        <Select label="Category" name="category" value={formData.category} onChange={handleFormChange}>
                            {(Object.values(ExpenseCategory) as string[]).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </Select>
                        <Input label="Paid To" name="paidTo" value={formData.paidTo} onChange={handleFormChange} placeholder="e.g., Local vendor" />
                        <Button type="submit" className="w-full" icon={<PlusIcon />}>Add Expense</Button>
                    </form>
                </Card>

                <Card title="Expenses Log" className="lg:col-span-2">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Input label="From" type="date" name="from" value={dateRange.from} onChange={e => setDateRange(prev => ({...prev, from: e.target.value}))} containerClassName="flex-grow"/>
                            <Input label="To" type="date" name="to" value={dateRange.to} onChange={e => setDateRange(prev => ({...prev, to: e.target.value}))} containerClassName="flex-grow"/>
                        </div>
                        <Button onClick={handleExport} icon={<ExportIcon />} variant="secondary">Export</Button>
                    </div>

                    <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses for Period</p>
                        <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">₹{totalExpenses.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                <tr>
                                    {['Date', 'Description', 'Category', 'Amount (₹)', 'Actions'].map(header => (
                                        <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredExpenses.length > 0 ? filteredExpenses.map(e => (
                                    <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">{e.date}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{e.description}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">{e.category}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">₹{e.amount.toLocaleString('en-IN')}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                                            <button onClick={() => handleEditClick(e)} className="text-primary-600 hover:text-primary-900"><EditIcon className="w-5 h-5"/></button>
                                            <button onClick={() => setExpenseToDelete(e)} className="text-red-600 hover:text-red-900"><DeleteIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">No expenses recorded for this period.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            
            <Modal isOpen={!!expenseToDelete} onClose={() => setExpenseToDelete(null)} title="Confirm Deletion">
                <p>Are you sure you want to delete the expense: "{expenseToDelete?.description}"?</p>
                <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="secondary" onClick={() => setExpenseToDelete(null)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>Delete</Button>
                </div>
            </Modal>

            {editingExpense && (
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Expense">
                    <div className="space-y-4">
                        <Input label="Date" type="date" name="date" value={editingExpense.date} onChange={handleEditFormChange} required />
                        <Input label="Description" name="description" value={editingExpense.description} onChange={handleEditFormChange} required />
                        <Input label="Amount (₹)" type="number" name="amount" value={editingExpense.amount} onChange={handleEditFormChange} required min="0" />
                        <Select label="Category" name="category" value={editingExpense.category} onChange={handleEditFormChange}>
                            {(Object.values(ExpenseCategory) as string[]).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </Select>
                        <Input label="Paid To" name="paidTo" value={editingExpense.paidTo} onChange={handleEditFormChange} />
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateExpense}>Save Changes</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Expenses;
