
import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { RateCardItem } from '../../services/types';
import Modal from '../ui/Modal';
import { PlusIcon, EditIcon, DeleteIcon, ExportIcon } from '../../constants';
import { exportToExcel } from '../../utils/exportUtils';


const RateCard: React.FC = () => {
    const { rateCard, addRateCardItem, updateRateCardItem, deleteRateCardItem } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<RateCardItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<RateCardItem | null>(null);
    const [newItem, setNewItem] = useState<Omit<RateCardItem, 'id'>>({ studyName: '', mrp: 0, landingPrice: 0 });

    const openModalForNew = () => {
        setEditingItem(null);
        setNewItem({ studyName: '', mrp: 0, landingPrice: 0 });
        setIsModalOpen(true);
    };

    const openModalForEdit = (item: RateCardItem) => {
        setEditingItem(item);
        setNewItem({ studyName: item.studyName, mrp: item.mrp, landingPrice: item.landingPrice });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (editingItem) {
            updateRateCardItem({ ...editingItem, ...newItem });
        } else {
            addRateCardItem({ id: Date.now().toString(), ...newItem });
        }
        setIsModalOpen(false);
    };
    
    const handleDelete = () => {
        if (itemToDelete) {
            deleteRateCardItem(itemToDelete.id);
            setItemToDelete(null);
        }
    };

    const handleExport = () => {
        const dataToExport = rateCard.map((item, index) => ({
            'S.No': index + 1,
            'Study Name': item.studyName,
            'MRP (₹)': item.mrp,
            'Landing Price (₹)': item.landingPrice,
        }));
        exportToExcel(dataToExport, `sonography-rate-card-${new Date().toISOString().split('T')[0]}`);
    };

    return (
        <Card title="Sonography Rate Card">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Manage Tests</h3>
                <div className="flex gap-2">
                    <Button onClick={openModalForNew} icon={<PlusIcon />}>Add New Test</Button>
                    <Button onClick={handleExport} icon={<ExportIcon />} variant="secondary">Export</Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Study Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">MRP (₹)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Landing Price (₹)</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {rateCard.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.studyName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.mrp}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.landingPrice}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => openModalForEdit(item)} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => setItemToDelete(item)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><DeleteIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Test' : 'Add New Test'}>
                <div className="space-y-4">
                    <Input label="Study Name" value={newItem.studyName} onChange={e => setNewItem({ ...newItem, studyName: e.target.value })} />
                    <Input label="MRP (₹)" type="number" value={newItem.mrp} onChange={e => setNewItem({ ...newItem, mrp: parseFloat(e.target.value) || 0 })} />
                    <Input label="Landing Price (₹)" type="number" value={newItem.landingPrice} onChange={e => setNewItem({ ...newItem, landingPrice: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </Modal>
            
            <Modal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} title="Confirm Deletion">
                <p>Are you sure you want to delete the test "{itemToDelete?.studyName}"?</p>
                <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="secondary" onClick={() => setItemToDelete(null)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete</Button>
                </div>
            </Modal>
        </Card>
    );
};

export default RateCard;
