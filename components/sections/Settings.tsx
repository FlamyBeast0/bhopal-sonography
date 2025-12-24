
import React, { useContext, useRef, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import { THEMES, SparklesIcon, DeleteIcon } from '../../constants';
import { Settings as SettingsType } from '../../services/types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { downloadBackup } from '../../services/storageService';

const Settings: React.FC = () => {
    const { settings, updateSettings, patients, rateCard, expenses, restoreData, addToast, loadDemoData, clearAllData } = useContext(AppContext);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const handleThemeChange = (theme: SettingsType['theme']) => {
        updateSettings({ theme });
    };

    const handleBackup = () => {
        downloadBackup({ patients, rateCard, settings, expenses });
        addToast('Backup downloaded successfully!', 'success');
    };
    
    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result;
                    if (typeof text === 'string') {
                        const data = JSON.parse(text);
                        if (data.patients && data.rateCard) {
                             restoreData({ patients: data.patients, rateCard: data.rateCard, expenses: data.expenses || [] });
                        } else {
                            throw new Error('Invalid backup file format.');
                        }
                    }
                } catch (error) {
                    addToast('Failed to restore backup. Invalid file.', 'error');
                    console.error("Restore error:", error);
                }
            };
            reader.readAsText(file);
        }
    };

    const formatThemeName = (name: string) => {
        return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const triggerDemoMode = () => {
        loadDemoData();
        setIsDemoModalOpen(false);
    };

    const triggerReset = () => {
        clearAllData();
        setIsResetModalOpen(false);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            {/* Showcase & Demo Section */}
            <Card title="Showcase & Demo Mode" className="border-2 border-primary-500/30">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="bg-primary-500/10 p-6 rounded-full text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
                        <SparklesIcon className="w-12 h-12 animate-pulse" />
                    </div>
                    <div className="flex-1 space-y-2 text-center md:text-left">
                        <h4 className="text-xl font-bold text-slate-800 dark:text-white">Prepare for Presentation</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Sharing this app with a colleague? Use Demo Mode to instantly populate the dashboard with realistic patient and financial data.
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                            <Button onClick={() => setIsDemoModalOpen(true)} variant="primary" icon={<SparklesIcon />}>
                                Load Demo Data
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="Appearance Settings">
                <div>
                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Theme Selector</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {THEMES.map(theme => (
                            <button
                                key={theme.name}
                                onClick={() => handleThemeChange(theme.name)}
                                className={`h-20 rounded-xl flex items-center justify-center text-white font-bold text-sm tracking-wide transition-all duration-300 transform hover:scale-105 shadow-md ${settings.theme === theme.name ? 'ring-4 ring-offset-2 ring-primary-500 dark:ring-offset-gray-800 scale-105' : 'hover:shadow-lg'}`}
                                style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
                            >
                                <span className="drop-shadow-md text-center px-2">{formatThemeName(theme.name)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            <Card title="Data Management">
                <div className="space-y-4">
                     <p className="text-gray-600 dark:text-gray-400">Manage your application data. Use "Download Backup" to save your work or move it to another computer.</p>
                     <div className="flex flex-wrap gap-4 pt-2">
                        <Button onClick={handleBackup}>Download Backup</Button>
                        <Button onClick={handleRestoreClick} variant="secondary">Restore from Backup</Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".json"
                          className="hidden"
                        />
                     </div>
                </div>
            </Card>

            {/* DANGER ZONE */}
            <Card className="border-2 border-red-500/20 bg-red-50/30 dark:bg-red-900/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                        <DeleteIcon className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-bold text-red-800 dark:text-red-400">Danger Zone</h4>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-red-700 dark:text-red-300">
                        This action is permanent. Use this if you want to remove all demo data and start from scratch or restore your own real backup.
                    </p>
                    <Button variant="danger" onClick={() => setIsResetModalOpen(true)} icon={<DeleteIcon />}>
                        Reset Application & Clear All Data
                    </Button>
                </div>
            </Card>

            {/* Demo Confirmation Modal */}
            <Modal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} title="Confirm Demo Mode">
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        This will replace your current patient and expense records with **realistic demo data**.
                    </p>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Warning:</strong> Any unsaved entries will be lost. Please download a backup first if you have real data.
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <Button variant="secondary" onClick={() => setIsDemoModalOpen(false)}>Cancel</Button>
                        <Button onClick={triggerDemoMode} icon={<SparklesIcon />}>Yes, Load Demo Data</Button>
                    </div>
                </div>
            </Modal>

            {/* Reset Confirmation Modal */}
            <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="CRITICAL: Reset All Data">
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300 font-medium">
                        Are you sure you want to delete all patient records, expenses, and reset the rate card?
                    </p>
                    <div className="p-4 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg text-red-800 dark:text-red-200">
                        <p className="font-bold mb-1 uppercase tracking-tight">Warning: This cannot be undone!</p>
                        <p className="text-sm opacity-90">All data currently stored in this browser will be permanently erased.</p>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <Button variant="secondary" onClick={() => setIsResetModalOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={triggerReset} icon={<DeleteIcon />}>Confirm Permanent Reset</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Settings;
