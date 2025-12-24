
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Patient, RateCardItem, Settings, ToastMessage, Expense, NewPatientData, QueueStatus, PaymentMode, PatientType, ReferralStatus, ExpenseCategory } from '../services/types';
import { loadState, saveState, APP_STATE_KEY } from '../services/storageService';

interface AppContextType {
  patients: Patient[];
  rateCard: RateCardItem[];
  settings: Settings;
  expenses: Expense[];
  toasts: ToastMessage[];
  addPatient: (patient: NewPatientData) => Patient;
  updatePatient: (patient: Patient) => void;
  deletePatient: (patientId: string) => void;
  updatePatientQueueStatus: (patientId: string, status: QueueStatus) => void;
  addRateCardItem: (item: RateCardItem) => void;
  updateRateCardItem: (item: RateCardItem) => void;
  deleteRateCardItem: (itemId: string) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
  restoreData: (data: { patients: Patient[]; rateCard: RateCardItem[]; expenses?: Expense[] }) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  loadDemoData: () => void;
  clearAllData: () => void;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

const defaultRateCard: RateCardItem[] = [
    { id: '1', studyName: 'USG Abdomen', mrp: 1000, landingPrice: 800 },
    { id: '2', studyName: 'USG KUB', mrp: 1200, landingPrice: 1000 },
    { id: '3', studyName: 'USG Pelvis', mrp: 900, landingPrice: 700 },
    { id: '4', studyName: 'Anomaly Scan', mrp: 2500, landingPrice: 2200 },
];

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rateCard, setRateCard] = useState<RateCardItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<Settings>({
    theme: 'purple-blue',
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const loadedState = loadState();
    if (loadedState) {
      setPatients(loadedState.patients || []);
      setRateCard(loadedState.rateCard || defaultRateCard);
      setExpenses(loadedState.expenses || []);
      setSettings(loadedState.settings || { theme: 'purple-blue', darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches });
    } else {
      setRateCard(defaultRateCard);
    }

    const syncState = (event: StorageEvent) => {
        if (event.key === APP_STATE_KEY) {
            const state = loadState();
            if(state) {
                setPatients(state.patients);
                setRateCard(state.rateCard);
                setExpenses(state.expenses);
            }
        }
    };
    window.addEventListener('storage', syncState);
    return () => window.removeEventListener('storage', syncState);

  }, []);

  const saveData = useCallback(() => {
    saveState({ patients, rateCard, settings, expenses });
  }, [patients, rateCard, settings, expenses]);

  useEffect(() => {
    saveData();
  }, [saveData]);
  
  const addPatient = (patientData: NewPatientData): Patient => {
    const today = new Date().toISOString().split('T')[0];
    const todaysPatients = patients.filter(p => p.date === today);
    const maxToken = Math.max(0, ...todaysPatients.map(p => p.tokenNumber || 0));
    
    const newPatient: Patient = {
        ...patientData,
        id: Date.now().toString(),
        tokenNumber: maxToken + 1,
        queueStatus: QueueStatus.Waiting,
    };
    
    setPatients(prev => [...prev, newPatient]);
    addToast(`Patient added! Token No: ${newPatient.tokenNumber}`, 'success');
    return newPatient;
  };

  const updatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    addToast('Patient updated successfully!', 'success');
  };
  
  const updatePatientQueueStatus = (patientId: string, status: QueueStatus) => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, queueStatus: status } : p));
  };

  const deletePatient = (patientId: string) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    addToast('Patient deleted successfully!', 'info');
  };

  const addRateCardItem = (item: RateCardItem) => {
    setRateCard(prev => [...prev, item]);
     addToast('Rate card item added!', 'success');
  };

  const updateRateCardItem = (updatedItem: RateCardItem) => {
    setRateCard(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    addToast('Rate card item updated!', 'success');
  };

  const deleteRateCardItem = (itemId: string) => {
    setRateCard(prev => prev.filter(item => item.id !== itemId));
    addToast('Rate card item deleted!', 'info');
  };

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
    addToast('Expense added successfully!', 'success');
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    addToast('Expense updated successfully!', 'success');
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    addToast('Expense deleted successfully!', 'info');
  };
  
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({...prev, ...newSettings}));
  };
  
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  const restoreData = (data: { patients: Patient[]; rateCard: RateCardItem[]; expenses?: Expense[] }) => {
    setPatients(data.patients);
    setRateCard(data.rateCard);
    setExpenses(data.expenses || []);
    addToast('Data restored successfully!', 'success');
  };

  const loadDemoData = () => {
    const today = new Date().toISOString().split('T')[0];
    const demoPatients: Patient[] = [
        { id: 'd1', date: today, name: 'Rahul Sharma', age: 45, gender: 'Male', contact: '9876543210', doctorRef: 'Dr. Gupta', testId: '1', mrp: 1000, amountReceived: 1000, paymentMode: PaymentMode.Cash, remarks: 'Full payment', receivedBy: 'Receptionist A', patientType: PatientType.Direct, pro: '', referralAmount: 0, referralStatus: ReferralStatus.Pending, tokenNumber: 1, queueStatus: QueueStatus.Completed },
        { id: 'd2', date: today, name: 'Priya Verma', age: 28, gender: 'Female', contact: '9123456789', doctorRef: 'Dr. Singh', testId: '4', mrp: 2500, amountReceived: 2500, paymentMode: PaymentMode.Online, remarks: 'Emergency scan', receivedBy: 'Receptionist B', patientType: PatientType.Referral, pro: 'Dr. Singh', referralAmount: 300, referralStatus: ReferralStatus.Paid, tokenNumber: 2, queueStatus: QueueStatus.InProgress },
        { id: 'd3', date: today, name: 'Amit Patel', age: 52, gender: 'Male', contact: '9988776655', doctorRef: 'Dr. Khan', testId: '2', mrp: 1200, amountReceived: 1200, paymentMode: PaymentMode.Cash, remarks: '', receivedBy: 'Receptionist A', patientType: PatientType.Direct, pro: '', referralAmount: 0, referralStatus: ReferralStatus.Pending, tokenNumber: 3, queueStatus: QueueStatus.Waiting },
        { id: 'd4', date: today, name: 'Surbhi Jain', age: 31, gender: 'Female', contact: '9345678901', doctorRef: 'Dr. Mehta', testId: '3', mrp: 900, amountReceived: 800, paymentMode: PaymentMode.Cash, remarks: 'Discount given', receivedBy: 'Receptionist A', patientType: PatientType.Direct, pro: '', referralAmount: 0, referralStatus: ReferralStatus.Pending, tokenNumber: 4, queueStatus: QueueStatus.Waiting },
        { id: 'd5', date: today, name: 'Vijay Kumar', age: 60, gender: 'Male', contact: '9567890123', doctorRef: 'Dr. Gupta', testId: '1', mrp: 1000, amountReceived: 1000, paymentMode: PaymentMode.Card, remarks: '', receivedBy: 'Receptionist B', patientType: PatientType.Direct, pro: '', referralAmount: 0, referralStatus: ReferralStatus.Pending, tokenNumber: 5, queueStatus: QueueStatus.Waiting },
    ];

    const demoExpenses: Expense[] = [
        { id: 'e1', date: today, description: 'Office Electricity Bill', amount: 1500, category: ExpenseCategory.Maintenance, paidTo: 'MP Electricity Board' },
        { id: 'e2', date: today, description: 'Staff Tea & Coffee', amount: 200, category: ExpenseCategory.Refreshments, paidTo: 'Local Vendor' },
        { id: 'e3', date: today, description: 'Printer Paper Ream', amount: 450, category: ExpenseCategory.OfficeSupplies, paidTo: 'Stationery Mart' },
    ];

    setPatients(demoPatients);
    setExpenses(demoExpenses);
    setRateCard(defaultRateCard);
    addToast('Demo data loaded successfully! You can now showcase the app.', 'success');
  };

  const clearAllData = () => {
    setPatients([]);
    setExpenses([]);
    setRateCard(defaultRateCard);
    addToast('All data cleared. Application reset to defaults.', 'info');
  };

  const contextValue: AppContextType = {
    patients,
    rateCard,
    settings,
    expenses,
    toasts,
    addPatient,
    updatePatient,
    deletePatient,
    updatePatientQueueStatus,
    addRateCardItem,
    updateRateCardItem,
    deleteRateCardItem,
    updateSettings,
    addToast,
    removeToast,
    restoreData,
    addExpense,
    updateExpense,
    deleteExpense,
    loadDemoData,
    clearAllData,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
